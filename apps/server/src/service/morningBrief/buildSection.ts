import { getLogger } from "../../logger";
import { LongformMode, MorningBriefSection, SectionPayload, BriefItem, SourceUrls } from "../../dataModel/dataModel";
import { llmService } from "../../integration/llmService/llmService";
import { scrapePageHtml } from "../../integration/scrapePageHtml/scrapePageHtml";
import { parseHtmlWithMetrics } from "../parseHtml/parseHtml";
import { buildSelectionPrompt, buildSummaryPrompt } from "./prompts";

const log = getLogger("service/morningBrief/buildSection");

export interface SectionCandidate {
  id: string;
  title: string;
  source: string;
  url: string;
  score?: number;
  snippet?: string;
  /** Pre-fetched full text — skip scraping if provided (e.g. Reddit self-posts). */
  content?: string;
}

export interface SectionSpec {
  section: MorningBriefSection;
  mode?: LongformMode;
  displayName: string;
  n: number;
  fetchCandidates: () => Promise<SectionCandidate[]>;
}

/**
 * Callbacks for streaming progress updates. All optional — buildSection can
 * be called without them and behaves like a non-streaming function (returns
 * the full payload at the end).
 */
export interface BuildSectionCallbacks {
  /** Fires once Stage-1 picks are decided, with empty `summary` strings. */
  onSectionReady?: (payload: SectionPayload) => void;
  /** Fires for each token delta during Stage-2 summarisation. */
  onSummaryChunk?: (url: string, delta: string) => void;
  /** Fires once a single item's summary has finished streaming. */
  onSummaryDone?: (url: string) => void;
}

export async function buildSection(
  spec: SectionSpec,
  personalCtx: string,
  requestId: string,
  signal?: AbortSignal,
  callbacks?: BuildSectionCallbacks,
): Promise<SectionPayload> {
  if (signal?.aborted) throw new Error("Request aborted");

  const candidates = await spec.fetchCandidates();

  if (signal?.aborted) throw new Error("Request aborted");

  if (candidates.length === 0) {
    log.warn({ section: spec.section, requestId }, "No candidates found for section");
    return emptyPayload(spec);
  }

  log.info({ section: spec.section, candidates: candidates.length, requestId }, "Candidates fetched");

  // Stage 1: let Claude pick the best N
  const pickedIds = await selectCandidates(candidates, spec.n, spec.section, spec.mode, personalCtx, signal);
  let picked = pickedIds
    .map((id) => candidates.find((c) => c.id === id))
    .filter((c): c is SectionCandidate => c !== undefined);

  // Fallback to top-by-score if Claude selection fails
  if (picked.length === 0) {
    log.warn({ section: spec.section, requestId }, "Stage-1 selection empty, falling back to score order");
    picked = [...candidates].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, spec.n);
  }

  log.info(
    { section: spec.section, requestId, picks: picked.map((p) => `${p.title} [${p.source}]`) },
    "Stage-1 selected articles",
  );

  // Notify the caller that picks are decided so the UI can render skeleton items
  // immediately. Summaries fill in via onSummaryChunk while Stage-2 runs.
  const generatedAt = new Date().toISOString();
  if (callbacks?.onSectionReady) {
    const skeletonItems: BriefItem[] = picked.map((c) => ({
      title: c.title,
      url: c.url,
      source: c.source,
      summary: "",
    }));
    callbacks.onSectionReady({
      section: spec.section,
      mode: spec.mode,
      items: skeletonItems,
      generatedAt,
    });
  }

  if (signal?.aborted) throw new Error("Request aborted");

  // Stage 2: scrape + summarise each pick
  const contentByUrl = await scrapePickedContent(picked);

  const withContent = picked.filter((c) => !!contentByUrl.get(c.url));
  const snippetOnly = picked.filter((c) => !contentByUrl.get(c.url));
  if (snippetOnly.length > 0) {
    log.warn(
      { section: spec.section, requestId, snippetOnly: snippetOnly.map((c) => c.title) },
      "Scrape yielded no content — summarising from snippet",
    );
  }
  if (withContent.length > 0) {
    log.debug(
      { section: spec.section, requestId, scraped: withContent.map((c) => c.title) },
      "Scraped content ready",
    );
  }

  const items = await summarisePicked(
    picked,
    contentByUrl,
    spec.mode,
    personalCtx,
    requestId,
    signal,
    callbacks,
  );

  return { section: spec.section, mode: spec.mode, items, generatedAt };
}

function emptyPayload(spec: SectionSpec): SectionPayload {
  return { section: spec.section, mode: spec.mode, items: [], generatedAt: new Date().toISOString() };
}

async function selectCandidates(
  candidates: SectionCandidate[],
  n: number,
  section: MorningBriefSection,
  mode: LongformMode | undefined,
  personalCtx: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const prompt = buildSelectionPrompt(candidates, n, section, mode, personalCtx);

  let raw: string;
  try {
    raw = await llmService.complete(prompt, "claude-sonnet-4-6", signal);
  } catch (err) {
    if (signal?.aborted) throw err;
    log.warn({ section, err }, "Stage-1 LLM call failed, using score fallback");
    return [];
  }

  const parsed = tryParsePicksJson(raw);
  if (parsed) return parsed;

  if (signal?.aborted) throw new Error("Request aborted");

  // One retry with an explicit JSON-only reminder
  try {
    const retryRaw = await llmService.complete(
      prompt + "\n\nReturn ONLY the JSON object. No other text.",
      "claude-sonnet-4-6",
      signal,
    );
    const retryParsed = tryParsePicksJson(retryRaw);
    if (retryParsed) return retryParsed;
  } catch (err) {
    if (signal?.aborted) throw err;
    // ignore retry failure
  }

  log.warn({ section }, "Stage-1 JSON parse failed after retry, using score fallback");
  return [];
}

function tryParsePicksJson(raw: string): string[] | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[0]) as { picks?: unknown };
    if (Array.isArray(data.picks)) {
      return data.picks.filter((p): p is string => typeof p === "string");
    }
  } catch {
    // ignore
  }
  return null;
}

async function scrapePickedContent(picked: SectionCandidate[]): Promise<Map<string, string>> {
  const contentByUrl = new Map<string, string>();

  // Use pre-fetched content where available
  const toScrape = picked.filter((c) => !c.content);
  for (const c of picked) {
    if (c.content) contentByUrl.set(c.url, c.content);
  }

  if (toScrape.length === 0) return contentByUrl;

  const sourceUrls: SourceUrls = {};
  for (const c of toScrape) {
    if (!sourceUrls[c.source]) sourceUrls[c.source] = [];
    sourceUrls[c.source].push(c.url);
  }

  try {
    const pages = await scrapePageHtml(sourceUrls);
    const { newsPieces } = parseHtmlWithMetrics(pages);
    for (const piece of newsPieces) {
      const text = piece.body.filter(Boolean).join("\n\n");
      if (text) contentByUrl.set(piece.url, text);
    }
  } catch (err) {
    log.warn({ err }, "Scraping picked articles failed, will use snippets as fallback");
  }

  return contentByUrl;
}

async function summarisePicked(
  picked: SectionCandidate[],
  contentByUrl: Map<string, string>,
  mode: LongformMode | undefined,
  personalCtx: string,
  requestId: string,
  signal?: AbortSignal,
  callbacks?: BuildSectionCallbacks,
): Promise<BriefItem[]> {
  return Promise.all(
    picked.map(async (candidate) => {
      const content = contentByUrl.get(candidate.url) ?? candidate.snippet ?? "";
      const prompt = buildSummaryPrompt(
        candidate.title,
        candidate.source,
        candidate.url,
        content,
        mode,
        personalCtx,
      );
      log.debug({ title: candidate.title, requestId }, "Summarising article");
      let summary = "";
      try {
        for await (const delta of llmService.completeStream(prompt, "claude-sonnet-4-6", signal)) {
          summary += delta;
          callbacks?.onSummaryChunk?.(candidate.url, delta);
        }
      } catch (err) {
        if (signal?.aborted) throw err;
        log.warn({ title: candidate.title, requestId, err }, "Stage-2 LLM call failed");
      }
      callbacks?.onSummaryDone?.(candidate.url);
      return { title: candidate.title, url: candidate.url, source: candidate.source, summary };
    }),
  );
}

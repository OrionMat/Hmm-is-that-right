import { getLogger } from "../../logger";
import {
  LongformMode,
  MorningBriefSection,
  SectionPayload,
  BriefItem,
  SourceUrls,
  SectionDiagnostics,
  SourceQueryResult,
  CandidateMeta,
  ScrapeAttempt,
} from "../../dataModel/dataModel";
import { llmService } from "../../integration/llmService/llmService";
import { scrapePageHtml } from "../../integration/scrapePageHtml/scrapePageHtml";
import { parseHtmlWithMetrics } from "../parseHtml/parseHtml";
import { buildSelectionPrompt, buildSummaryPrompt } from "./prompts";

const log = getLogger("service/morningBrief/buildSection");

const LLM_MODEL = "claude-sonnet-4-6";

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

/** Result of a spec's candidate-fetching phase, including per-source health for diagnostics. */
export interface FetchCandidatesResult {
  candidates: SectionCandidate[];
  sources: SourceQueryResult[];
}

export interface SectionSpec {
  section: MorningBriefSection;
  mode?: LongformMode;
  displayName: string;
  n: number;
  fetchCandidates: () => Promise<FetchCandidatesResult>;
}

/**
 * Callbacks for streaming progress updates. All optional — buildSection can
 * be called without them and behaves like a non-streaming function (returns
 * the full payload at the end). Diagnostics are returned as part of the
 * result rather than via a callback because they're only fully known at the
 * end of the pipeline.
 */
export interface BuildSectionCallbacks {
  /** Fires once Stage-1 picks are decided, with empty `summary` strings. */
  onSectionReady?: (payload: SectionPayload) => void;
  /** Fires for each token delta during Stage-2 summarisation. */
  onSummaryChunk?: (url: string, delta: string) => void;
  /** Fires once a single item's summary has finished streaming. */
  onSummaryDone?: (url: string) => void;
}

export interface BuildSectionResult {
  payload: SectionPayload;
  diagnostics: SectionDiagnostics;
}

export async function buildSection(
  spec: SectionSpec,
  personalCtx: string,
  requestId: string,
  signal?: AbortSignal,
  callbacks?: BuildSectionCallbacks,
): Promise<BuildSectionResult> {
  if (signal?.aborted) throw new Error("Request aborted");

  const startedAt = Date.now();
  const personalContextUsed = personalCtx.trim().length > 0;

  const fetchStart = Date.now();
  const fetchResult = await spec.fetchCandidates();
  const fetchCandidatesMs = Date.now() - fetchStart;
  const candidates = fetchResult.candidates;
  const sourcesQueried = fetchResult.sources;

  if (signal?.aborted) throw new Error("Request aborted");

  if (candidates.length === 0) {
    log.warn({ section: spec.section, requestId }, "No candidates found for section");
    const diagnostics = makeDiagnostics({
      spec,
      sources: sourcesQueried,
      candidateMetas: [],
      selectionMethod: "none",
      scrapes: [],
      personalContextUsed,
      durations: {
        fetchCandidatesMs,
        selectionMs: 0,
        scrapingMs: 0,
        summarisationMs: 0,
        totalMs: Date.now() - startedAt,
      },
    });
    return { payload: emptyPayload(spec), diagnostics };
  }

  log.info({ section: spec.section, candidates: candidates.length, requestId }, "Candidates fetched");

  // Stage 1: let Claude pick the best N
  const selectionStart = Date.now();
  const pickedIds = await selectCandidates(candidates, spec.n, spec.section, spec.mode, personalCtx, signal);
  let picked = pickedIds
    .map((id) => candidates.find((c) => c.id === id))
    .filter((c): c is SectionCandidate => c !== undefined);

  // Fallback to top-by-score if Claude selection fails
  let selectionMethod: SectionDiagnostics["selectionMethod"] = "llm";
  if (picked.length === 0) {
    log.warn({ section: spec.section, requestId }, "Stage-1 selection empty, falling back to score order");
    picked = [...candidates].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, spec.n);
    selectionMethod = "score-fallback";
  }
  const selectionMs = Date.now() - selectionStart;

  const pickedUrls = new Set(picked.map((p) => p.url));
  const candidateMetas: CandidateMeta[] = candidates.map((c) => ({
    id: c.id,
    title: c.title,
    source: c.source,
    url: c.url,
    score: c.score,
    picked: pickedUrls.has(c.url),
  }));

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
  const scrapeStart = Date.now();
  const { contentByUrl, scrapes } = await scrapePickedContent(picked);
  const scrapingMs = Date.now() - scrapeStart;

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

  const summariseStart = Date.now();
  const items = await summarisePicked(
    picked,
    contentByUrl,
    spec.mode,
    personalCtx,
    requestId,
    signal,
    callbacks,
  );
  const summarisationMs = Date.now() - summariseStart;

  const diagnostics = makeDiagnostics({
    spec,
    sources: sourcesQueried,
    candidateMetas,
    selectionMethod,
    scrapes,
    personalContextUsed,
    durations: {
      fetchCandidatesMs,
      selectionMs,
      scrapingMs,
      summarisationMs,
      totalMs: Date.now() - startedAt,
    },
  });

  return {
    payload: { section: spec.section, mode: spec.mode, items, generatedAt },
    diagnostics,
  };
}

function makeDiagnostics(args: {
  spec: SectionSpec;
  sources: SourceQueryResult[];
  candidateMetas: CandidateMeta[];
  selectionMethod: SectionDiagnostics["selectionMethod"];
  scrapes: ScrapeAttempt[];
  personalContextUsed: boolean;
  durations: SectionDiagnostics["durations"];
}): SectionDiagnostics {
  return {
    section: args.spec.section,
    mode: args.spec.mode,
    cacheHit: false,
    llmModel: LLM_MODEL,
    selectionMethod: args.selectionMethod,
    personalContextUsed: args.personalContextUsed,
    sources: args.sources,
    candidates: args.candidateMetas,
    scrapes: args.scrapes,
    durations: args.durations,
  };
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
    raw = await llmService.complete(prompt, LLM_MODEL, signal);
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
      LLM_MODEL,
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

async function scrapePickedContent(
  picked: SectionCandidate[],
): Promise<{ contentByUrl: Map<string, string>; scrapes: ScrapeAttempt[] }> {
  const contentByUrl = new Map<string, string>();
  const scrapes: ScrapeAttempt[] = [];

  // Use pre-fetched content where available
  const toScrape = picked.filter((c) => !c.content);
  for (const c of picked) {
    if (c.content) {
      contentByUrl.set(c.url, c.content);
      scrapes.push({
        url: c.url,
        title: c.title,
        source: c.source,
        outcome: "prefetched",
        contentChars: c.content.length,
      });
    }
  }

  if (toScrape.length === 0) {
    return { contentByUrl, scrapes };
  }

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

  for (const c of toScrape) {
    const text = contentByUrl.get(c.url);
    if (text) {
      scrapes.push({
        url: c.url,
        title: c.title,
        source: c.source,
        outcome: "scraped",
        contentChars: text.length,
      });
    } else {
      scrapes.push({
        url: c.url,
        title: c.title,
        source: c.source,
        outcome: "snippet-fallback",
        contentChars: c.snippet?.length ?? 0,
      });
    }
  }

  return { contentByUrl, scrapes };
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
        for await (const delta of llmService.completeStream(prompt, LLM_MODEL, signal)) {
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

import { getLogger } from "../../logger";
import { fetchTopPapers } from "../../integration/semanticScholar/semanticScholar";
import { llmService } from "../../integration/llmService/llmService";
import { buildPaperSelectionPrompt } from "./prompts";
import { personalContext } from "../morningBrief/personalContext";
import { PaperOfYear } from "../../dataModel/dataModel";

const log = getLogger("service/paperOfYear/selectPaper");
const LLM_MODEL = "claude-sonnet-4-6";

function tryParseSelection(raw: string, maxIndex: number): { index: number; whyInteresting: string } | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[0]) as { index?: unknown; whyInteresting?: unknown };
    if (
      typeof data.index === "number" &&
      data.index >= 1 &&
      data.index <= maxIndex &&
      typeof data.whyInteresting === "string" &&
      data.whyInteresting.trim().length > 0
    ) {
      return { index: data.index, whyInteresting: data.whyInteresting.trim() };
    }
  } catch {
    // ignore
  }
  return null;
}

export async function selectPaperOfYear(signal?: AbortSignal): Promise<PaperOfYear> {
  const candidates = await fetchTopPapers();
  if (candidates.length === 0) {
    throw new Error("No paper candidates found");
  }

  const prompt = buildPaperSelectionPrompt(candidates, personalContext);

  let parsed: { index: number; whyInteresting: string } | null = null;

  try {
    const raw = await llmService.complete(prompt, LLM_MODEL, signal);
    parsed = tryParseSelection(raw, candidates.length);
  } catch (err) {
    if (signal?.aborted) throw err;
    log.warn({ err }, "Paper selection LLM call failed");
  }

  if (!parsed && !signal?.aborted) {
    try {
      const retryRaw = await llmService.complete(
        prompt + "\n\nReturn ONLY the JSON object. No other text.",
        LLM_MODEL,
        signal,
      );
      parsed = tryParseSelection(retryRaw, candidates.length);
    } catch (err) {
      if (signal?.aborted) throw err;
      log.warn({ err }, "Paper selection retry failed");
    }
  }

  const selected =
    parsed !== null
      ? { candidate: candidates[parsed.index - 1], whyInteresting: parsed.whyInteresting }
      : { candidate: candidates[0], whyInteresting: "The most cited recent open-access STEM paper." };

  if (parsed === null) {
    log.warn("Paper selection JSON parse failed after retry — falling back to top candidate");
  }

  const { candidate, whyInteresting } = selected;
  log.info({ arxivId: candidate.arxivId, title: candidate.title, citationCount: candidate.citationCount }, "Paper of the year selected");

  return {
    arxivId: candidate.arxivId,
    title: candidate.title,
    abstract: candidate.abstract,
    authors: candidate.authors,
    year: candidate.year,
    citationCount: candidate.citationCount,
    whyInteresting,
    selectedAt: new Date().toISOString(),
  };
}

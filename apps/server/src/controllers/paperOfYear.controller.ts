import { Request, Response } from "express";
import { getLogger } from "../logger";
import { cacheGet, cacheSet } from "../service/morningBrief/cache";
import { selectPaperOfYear } from "../service/paperOfYear/selectPaper";
import { SemanticScholarRateLimitError } from "../integration/semanticScholar/semanticScholar";
import { loadPaperFromDisk, savePaperToDisk } from "../service/paperOfYear/diskCache";
import { getPaperBody } from "../service/paperOfYear/fetchPaperBody";
import { buildQaPrompt } from "../service/paperOfYear/prompts";
import { getMondayCacheKey } from "../service/paperOfYear/cacheKeys";
import { llmService } from "../integration/llmService/llmService";
import { PaperOfYear } from "../dataModel/dataModel";
import { PaperOfYearQaBody } from "../schemas/paperOfYear.schema";

const log = getLogger("controllers/paperOfYear");

const PAPER_SELECTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RATE_LIMIT_BACKOFF_MS = 60 * 60 * 1000;
const LLM_MODEL = "claude-sonnet-4-6";

let rateLimitedUntil = 0;

function rateLimitedResponse(response: Response): void {
  response.status(503).json({
    message: "Paper service temporarily unavailable — rate limited by Semantic Scholar. Try again in a few minutes.",
  });
}

function emit(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function paperOfYearGetController(request: Request, response: Response): Promise<void> {
  const requestId = request.id ? String(request.id) : "unknown";
  const key = getMondayCacheKey();

  const cached = cacheGet<PaperOfYear>(key);
  if (cached) {
    log.info({ requestId, arxivId: cached.arxivId, cacheHit: "memory" }, "Paper of the year cache hit");
    response.json(cached);
    return;
  }

  const fromDisk = await loadPaperFromDisk(key);
  if (fromDisk) {
    cacheSet<PaperOfYear>(key, fromDisk, PAPER_SELECTION_TTL_MS);
    log.info({ requestId, arxivId: fromDisk.arxivId, cacheHit: "disk" }, "Paper of the year disk cache hit");
    response.json(fromDisk);
    return;
  }

  if (Date.now() < rateLimitedUntil) {
    log.info({ requestId, rateLimitedUntil }, "Paper of the year short-circuit: within rate-limit backoff window");
    rateLimitedResponse(response);
    return;
  }

  try {
    const paper = await selectPaperOfYear();
    cacheSet<PaperOfYear>(key, paper, PAPER_SELECTION_TTL_MS);
    await savePaperToDisk(key, paper, PAPER_SELECTION_TTL_MS);
    log.info({ requestId, arxivId: paper.arxivId, cacheHit: false }, "Paper of the year selected and cached");
    response.json(paper);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error({ requestId, message }, "Failed to select paper of the year");
    if (err instanceof SemanticScholarRateLimitError) {
      rateLimitedUntil = Date.now() + RATE_LIMIT_BACKOFF_MS;
      rateLimitedResponse(response);
    } else {
      response.status(500).json({ message: "Failed to select paper of the year" });
    }
  }
}

export async function paperOfYearQaController(request: Request, response: Response): Promise<void> {
  const requestId = request.id ? String(request.id) : "unknown";
  const { arxivId, question, history } = (request.validated?.body ?? {}) as PaperOfYearQaBody;

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("X-Accel-Buffering", "no");
  response.flushHeaders();
  response.socket?.setNoDelay(true);

  const ac = new AbortController();
  const keepalive = setInterval(() => response.write(": keepalive\n\n"), 15000);

  request.on("close", () => {
    ac.abort();
    clearInterval(keepalive);
  });

  try {
    const paper = cacheGet<PaperOfYear>(getMondayCacheKey());
    if (!paper) {
      emit(response, "qa_error", { message: "Paper not loaded. Fetch /api/paper-of-year first." });
      response.end();
      return;
    }

    if (paper.arxivId !== arxivId) {
      emit(response, "qa_error", { message: "Paper ID mismatch. Reload the page and try again." });
      response.end();
      return;
    }

    const { text } = await getPaperBody(paper);
    if (ac.signal.aborted) return;

    const prompt = buildQaPrompt(paper.title, paper.abstract, text, history, question);

    log.info({ requestId, arxivId, questionLength: question.length }, "Paper Q&A stream started");

    for await (const delta of llmService.completeStream(prompt, LLM_MODEL, ac.signal)) {
      emit(response, "qa_chunk", { delta });
    }

    if (!ac.signal.aborted) {
      emit(response, "qa_done", {});
      response.end();
      log.info({ requestId, arxivId }, "Paper Q&A stream complete");
    }
  } catch (err) {
    if (ac.signal.aborted) return;
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error({ requestId, message }, "Paper Q&A failed");
    emit(response, "qa_error", { message });
    response.end();
  } finally {
    clearInterval(keepalive);
  }
}

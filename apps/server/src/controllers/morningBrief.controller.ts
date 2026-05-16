import { Request, Response } from "express";
import { getLogger } from "../logger";
import { serverConfig } from "../config/serverConfig";
import { SectionDiagnostics, SectionPayload } from "../dataModel/dataModel";
import { getModeForDate } from "../service/morningBrief/modeRotation";
import { cacheKey, cacheGet, cacheSet } from "../service/morningBrief/cache";
import { personalContext } from "../service/morningBrief/personalContext";
import { buildSection } from "../service/morningBrief/buildSection";
import { worldSpec, techSpec, longformSpec } from "../service/morningBrief/sectionSpecs";
import { searchSpec } from "../service/morningBrief/searchSpec";
import { MorningBriefQuery, TOGGLE_SOURCES } from "../schemas/morningBrief.schema";

interface CachedSection {
  payload: SectionPayload;
  diagnostics: SectionDiagnostics;
}

const log = getLogger("controllers/morningBrief");

// One concurrent brief per client IP — prevents runaway Claude spend on refresh-spam.
const inFlight = new Set<string>();

function emit(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function morningBriefController(request: Request, response: Response): Promise<void> {
  const clientIp = request.ip ?? "unknown";

  if (inFlight.has(clientIp)) {
    log.warn({ clientIp }, "Morning Brief rejected — request already in flight for this IP");
    response.status(429).json({ message: "A brief is already being generated. Please wait." });
    return;
  }
  inFlight.add(clientIp);

  const {
    date: dateParam,
    nocache,
    query,
    sources: enabledSourcesParam,
  } = (request.validated?.query ?? {}) as MorningBriefQuery;
  const requestId = request.id ? String(request.id) : "unknown";
  const enabledSources = enabledSourcesParam ?? [...TOGGLE_SOURCES];

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("X-Accel-Buffering", "no");
  response.flushHeaders();
  response.socket?.setNoDelay(true);

  const date = dateParam ? new Date(dateParam) : new Date();
  const dateStr = date.toISOString().split("T")[0];
  const mode = getModeForDate(date);
  const ttlMs = serverConfig.morningBriefCacheTtlMs;
  const bypassCache = nocache === "1";
  const isSearchMode = !!query;

  log.info(
    { requestId, dateStr, mode, bypassCache, isSearchMode, enabledSources },
    "Morning Brief request started",
  );

  // Emit section_start for whichever sections we're about to build, so the
  // client renders the right spinners immediately.
  if (isSearchMode) {
    emit(response, "section_start", { section: "search" });
  } else {
    emit(response, "section_start", { section: "world" });
    emit(response, "section_start", { section: "tech" });
    emit(response, "section_start", { section: "longform", mode });
  }

  const ac = new AbortController();
  const startedAt = Date.now();
  let streamCompleted = false;
  const keepalive = setInterval(() => response.write(": keepalive\n\n"), 15000);

  request.on("close", () => {
    if (streamCompleted) return; // normal TCP close after response.end() — not a true disconnect
    ac.abort();
    clearInterval(keepalive);
    inFlight.delete(clientIp);
    log.info({ requestId }, "Client disconnected mid-stream — brief aborted");
  });

  // Search-mode results are query-specific so the date-based cache key would
  // collide across queries — disable cache for search.
  const sections = isSearchMode
    ? [{ spec: searchSpec(query!, enabledSources), key: undefined }]
    : [
        { spec: worldSpec(enabledSources), key: cacheKey(dateStr, "world", enabledSources.join(",")) },
        { spec: techSpec(), key: cacheKey(dateStr, "tech") },
        { spec: longformSpec(mode), key: cacheKey(dateStr, "longform", mode) },
      ];

  try {
    await Promise.allSettled(
      sections.map(async ({ spec, key }) => {
        const section = spec.section;
        try {
          if (ac.signal.aborted) return;
          const cached = bypassCache || !key ? undefined : cacheGet<CachedSection>(key);
          if (cached) {
            // Cache hit — emit the full payload in one shot. Client renders summaries
            // immediately and ignores the streaming protocol for this section.
            // Override durations: the stored timings are from the original build, which
            // would be misleading on a sub-millisecond cache hit. Stage timings are zero;
            // totalMs reflects how long this cache hit actually took to serve.
            log.info({ section, requestId }, "Cache hit");
            const cacheServeStart = Date.now();
            emit(response, "section_complete", cached.payload);
            emit(response, "section_diagnostics", {
              ...cached.diagnostics,
              cacheHit: true,
              durations: {
                fetchCandidatesMs: 0,
                selectionMs: 0,
                scrapingMs: 0,
                summarisationMs: 0,
                totalMs: Date.now() - cacheServeStart,
              },
            });
            return;
          }
          // Track whether onSectionReady fired so we can fall back to emitting
          // section_complete here if buildSection returns without ever emitting
          // (e.g. zero candidates → emptyPayload returns early before the callback).
          let readyEmitted = false;
          const { payload, diagnostics } = await buildSection(
            spec,
            personalContext,
            requestId,
            ac.signal,
            {
              onSectionReady: (initial) => {
                readyEmitted = true;
                emit(response, "section_complete", initial);
              },
              onSummaryChunk: (url, delta) => {
                if (ac.signal.aborted) return;
                emit(response, "summary_chunk", { section, url, delta });
              },
              onSummaryDone: (url) => {
                if (ac.signal.aborted) return;
                emit(response, "summary_done", { section, url });
              },
            },
          );
          if (ac.signal.aborted) return;
          if (key) cacheSet<CachedSection>(key, { payload, diagnostics }, ttlMs);
          if (!readyEmitted) {
            // No picks were made (empty section) — emit section_complete with the
            // empty payload so the client gets a final state.
            emit(response, "section_complete", payload);
          }
          emit(response, "section_diagnostics", diagnostics);
        } catch (err) {
          if (ac.signal.aborted) return;
          const message = err instanceof Error ? err.message : "Unknown error";
          log.error({ section, requestId, message }, "Section failed");
          emit(response, "section_error", { section, message });
        }
      }),
    );
  } finally {
    clearInterval(keepalive);
    inFlight.delete(clientIp);
  }

  if (!ac.signal.aborted) {
    streamCompleted = true;
    log.info({ requestId, durationMs: Date.now() - startedAt }, "Morning Brief complete");
    emit(response, "done", {});
    response.end();
  }
}

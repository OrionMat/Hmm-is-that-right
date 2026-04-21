import { Request, Response } from "express";
import { getLogger } from "../logger";
import { serverConfig } from "../config/serverConfig";
import { SectionPayload } from "../dataModel/dataModel";
import { getModeForDate } from "../service/morningBrief/modeRotation";
import { cacheKey, cacheGet, cacheSet } from "../service/morningBrief/cache";
import { personalContext } from "../service/morningBrief/personalContext";
import { buildSection } from "../service/morningBrief/buildSection";
import { worldSpec, techSpec, longformSpec } from "../service/morningBrief/sectionSpecs";
import { MorningBriefQuery } from "../schemas/morningBrief.schema";

const log = getLogger("controllers/morningBrief");

function emit(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function morningBriefController(request: Request, response: Response): Promise<void> {
  const { date: dateParam, nocache } = (request.validated?.query ?? {}) as MorningBriefQuery;
  const requestId = request.id ? String(request.id) : "unknown";

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

  log.info({ requestId, dateStr, mode, bypassCache }, "Morning Brief request started");

  // Emit section_start for all three sections immediately so the client shows spinners
  emit(response, "section_start", { section: "world" });
  emit(response, "section_start", { section: "tech" });
  emit(response, "section_start", { section: "longform", mode });

  const keepalive = setInterval(() => response.write(": keepalive\n\n"), 15000);
  request.on("close", () => clearInterval(keepalive));

  const sections = [
    { spec: worldSpec(), key: cacheKey(dateStr, "world") },
    { spec: techSpec(), key: cacheKey(dateStr, "tech") },
    { spec: longformSpec(mode), key: cacheKey(dateStr, "longform", mode) },
  ];

  await Promise.allSettled(
    sections.map(async ({ spec, key }) => {
      const section = spec.section;
      try {
        const cached = bypassCache ? undefined : cacheGet<SectionPayload>(key);
        if (cached) {
          log.info({ section, requestId }, "Cache hit");
          emit(response, "section_complete", cached);
          return;
        }
        const payload = await buildSection(spec, personalContext, requestId);
        cacheSet(key, payload, ttlMs);
        emit(response, "section_complete", payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        log.error({ section, requestId, message }, "Section failed");
        emit(response, "section_error", { section, message });
      }
    }),
  );

  clearInterval(keepalive);
  emit(response, "done", {});
  response.end();
}

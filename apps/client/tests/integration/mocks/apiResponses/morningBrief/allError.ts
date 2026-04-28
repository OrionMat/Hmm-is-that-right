import type { SseEvent } from "./happyPath";

export const ALL_ERROR_SSE_EVENTS: SseEvent[] = [
  { event: "section_start", data: { section: "world" } },
  { event: "section_start", data: { section: "tech" } },
  { event: "section_start", data: { section: "longform" } },

  { event: "section_error", data: { section: "world", message: "Reuters feed unavailable" } },
  { event: "section_error", data: { section: "tech", message: "HN API timeout" } },
  { event: "section_error", data: { section: "longform", message: "Readability extraction failed" } },

  { event: "done", data: {} },
];

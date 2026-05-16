import {
  MorningBriefSection,
  SectionPayload,
  LongformMode,
  SummaryChunkPayload,
  SummaryDonePayload,
  SectionDiagnostics,
} from "../dataModel/dataModel";

export interface MorningBriefHandlers {
  onSectionStart: (section: MorningBriefSection, mode?: LongformMode) => void;
  onSectionComplete: (payload: SectionPayload) => void;
  onSectionError: (section: MorningBriefSection, message: string) => void;
  onSummaryChunk?: (payload: SummaryChunkPayload) => void;
  onSummaryDone?: (payload: SummaryDonePayload) => void;
  onSectionDiagnostics?: (diagnostics: SectionDiagnostics) => void;
  onDone: () => void;
  onConnectionError: () => void;
}

export interface MorningBriefOptions {
  /** Optional free-form query. When set, the server runs a SerpAPI search and
   *  replaces the three default sections with a single "search" section. */
  query?: string;
  /** Which toggle-able sources are enabled (e.g. ["bbc", "nyt", "ap"]). */
  sources?: string[];
}

/**
 * Opens an SSE connection to /api/morning-brief/stream and dispatches
 * typed events to the provided handlers.
 * @returns disposer — call to close the stream early.
 */
export function subscribeMorningBrief(
  handlers: MorningBriefHandlers,
  options: MorningBriefOptions = {},
): () => void {
  const params = new URLSearchParams();
  if (options.query) params.set("query", options.query);
  for (const source of options.sources ?? []) {
    params.append("sources", source);
  }
  const qs = params.toString();
  const url = qs ? `/api/morning-brief/stream?${qs}` : "/api/morning-brief/stream";
  const es = new EventSource(url);

  es.addEventListener("section_start", (e: MessageEvent) => {
    const data = JSON.parse(e.data) as { section: MorningBriefSection; mode?: LongformMode };
    handlers.onSectionStart(data.section, data.mode);
  });

  es.addEventListener("section_complete", (e: MessageEvent) => {
    const payload = JSON.parse(e.data) as SectionPayload;
    handlers.onSectionComplete(payload);
  });

  es.addEventListener("section_error", (e: MessageEvent) => {
    const data = JSON.parse(e.data) as { section: MorningBriefSection; message: string };
    handlers.onSectionError(data.section, data.message);
  });

  es.addEventListener("summary_chunk", (e: MessageEvent) => {
    const payload = JSON.parse(e.data) as SummaryChunkPayload;
    handlers.onSummaryChunk?.(payload);
  });

  es.addEventListener("summary_done", (e: MessageEvent) => {
    const payload = JSON.parse(e.data) as SummaryDonePayload;
    handlers.onSummaryDone?.(payload);
  });

  es.addEventListener("section_diagnostics", (e: MessageEvent) => {
    const payload = JSON.parse(e.data) as SectionDiagnostics;
    handlers.onSectionDiagnostics?.(payload);
  });

  let doneReceived = false;

  es.addEventListener("done", () => {
    doneReceived = true;
    handlers.onDone();
    es.close();
  });

  // onerror fires on both real connection failures AND after the server closes the
  // stream normally (because res.end() triggers a browser-level error event).
  // Guard with doneReceived so a clean completion never shows an error banner.
  es.onerror = () => {
    if (doneReceived) return;
    handlers.onConnectionError();
    es.close();
  };

  return () => es.close();
}

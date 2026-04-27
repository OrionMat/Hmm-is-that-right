import {
  MorningBriefSection,
  SectionPayload,
  LongformMode,
  SummaryChunkPayload,
  SummaryDonePayload,
} from "../dataModel/dataModel";

export interface MorningBriefHandlers {
  onSectionStart: (section: MorningBriefSection, mode?: LongformMode) => void;
  onSectionComplete: (payload: SectionPayload) => void;
  onSectionError: (section: MorningBriefSection, message: string) => void;
  onSummaryChunk?: (payload: SummaryChunkPayload) => void;
  onSummaryDone?: (payload: SummaryDonePayload) => void;
  onDone: () => void;
  onConnectionError: () => void;
}

/**
 * Opens an SSE connection to /api/morning-brief/stream and dispatches
 * typed events to the provided handlers.
 * @returns disposer — call to close the stream early.
 */
export function subscribeMorningBrief(handlers: MorningBriefHandlers): () => void {
  const es = new EventSource("/api/morning-brief/stream");

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

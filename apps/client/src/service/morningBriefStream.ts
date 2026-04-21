import { MorningBriefSection, SectionPayload, LongformMode } from "../dataModel/dataModel";

export interface MorningBriefHandlers {
  onSectionStart: (section: MorningBriefSection, mode?: LongformMode) => void;
  onSectionComplete: (payload: SectionPayload) => void;
  onSectionError: (section: MorningBriefSection, message: string) => void;
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

  es.addEventListener("done", () => {
    handlers.onDone();
    es.close();
  });

  es.onerror = () => {
    handlers.onConnectionError();
    es.close();
  };

  return () => es.close();
}

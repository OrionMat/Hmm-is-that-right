import { PaperOfYear, ConversationTurn } from "../dataModel/dataModel";

export async function fetchPaperOfYear(): Promise<PaperOfYear> {
  const response = await fetch("/api/paper-of-year");
  if (!response.ok) {
    throw new Error(`Paper fetch failed: ${response.status}`);
  }
  return response.json() as Promise<PaperOfYear>;
}

export interface QaHandlers {
  onChunk: (delta: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export async function streamPaperQa(
  arxivId: string,
  question: string,
  history: ConversationTurn[],
  handlers: QaHandlers,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/paper-of-year/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ arxivId, question, history }),
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return;
    handlers.onError(err instanceof Error ? err.message : "Connection failed");
    return;
  }

  if (!response.ok || !response.body) {
    handlers.onError(`Server error: ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split on double-newline SSE event boundaries; keep last partial block in buffer
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed || trimmed.startsWith(":")) continue; // skip keepalive comments

        let eventType = "";
        let dataLine = "";
        for (const line of trimmed.split("\n")) {
          if (line.startsWith("event: ")) eventType = line.slice(7).trim();
          if (line.startsWith("data: ")) dataLine = line.slice(6);
        }

        if (!dataLine) continue;

        try {
          const parsed = JSON.parse(dataLine) as Record<string, unknown>;
          if (eventType === "qa_chunk") handlers.onChunk(parsed.delta as string);
          else if (eventType === "qa_done") { handlers.onDone(); return; }
          else if (eventType === "qa_error") { handlers.onError(parsed.message as string); return; }
        } catch {
          // ignore malformed events
        }
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return;
    handlers.onError(err instanceof Error ? err.message : "Stream error");
  } finally {
    reader.releaseLock();
  }
}

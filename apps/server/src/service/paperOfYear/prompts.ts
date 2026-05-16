import { PaperCandidate, ConversationTurn } from "../../dataModel/dataModel";

const ABSTRACT_PREVIEW_CHARS = 300;
const MAX_PAPER_BODY_CHARS = 28000;

export function buildPaperSelectionPrompt(
  candidates: PaperCandidate[],
  personalCtx: string,
): string {
  const candidateLines = candidates
    .map((c, i) => {
      const authorStr =
        c.authors.length <= 3
          ? c.authors.join(", ")
          : `${c.authors.slice(0, 3).join(", ")} et al.`;
      const abstract =
        c.abstract.length > 0
          ? `\n   Abstract: ${c.abstract.slice(0, ABSTRACT_PREVIEW_CHARS)}${c.abstract.length > ABSTRACT_PREVIEW_CHARS ? "…" : ""}`
          : "";
      return `[${i + 1}] "${c.title}" by ${authorStr} (${c.year}, ${c.citationCount.toLocaleString()} citations)${abstract}`;
    })
    .join("\n\n");

  return `You are selecting the single most intellectually stimulating recent academic paper for a reader.

Personal context:
${personalCtx}

Pick the paper that would be most genuinely interesting to this reader. Consider their background and interests carefully.

Candidates:
${candidateLines}

Respond with ONLY valid JSON — no explanation, no markdown:
{"index": <1-based number>, "whyInteresting": "<one sentence, max 30 words, written in second person addressing the reader>"}`;
}

export function buildQaPrompt(
  title: string,
  abstract: string,
  paperBody: string,
  history: ConversationTurn[],
  question: string,
): string {
  const bodySection =
    paperBody.length > 0
      ? `Paper content:\n${paperBody.slice(0, MAX_PAPER_BODY_CHARS)}`
      : `Abstract (full text unavailable — answering from abstract only):\n${abstract}`;

  const historyBlock =
    history.length > 0
      ? "\n\nConversation so far:\n" +
        history
          .map((t) => `${t.role === "user" ? "User" : "Assistant"}: ${t.content}`)
          .join("\n\n")
      : "";

  return `You are a research assistant helping a reader understand a scientific paper. Answer questions accurately and concisely. Use markdown for formatting where it helps clarity.

Paper: "${title}"

${bodySection}${historyBlock}

User question: ${question}`;
}

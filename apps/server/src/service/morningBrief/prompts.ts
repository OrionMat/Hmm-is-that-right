import { LongformMode, MorningBriefSection } from "../../dataModel/dataModel";
import { SectionCandidate } from "./buildSection";

const MODE_SELECTION_HINT: Record<LongformMode, string> = {
  "zoom-in":
    "Prioritise pieces that reveal the mechanism underneath — how something actually works at a deeper level.",
  "zoom-out":
    "Prioritise pieces that zoom out to a bigger pattern — essays, strategy pieces, or threads that reframe a familiar topic.",
  inversion:
    "Prioritise pieces where the insight is counterintuitive — where the consensus is wrong, or the conventional wisdom is backwards.",
};

const MODE_SUMMARY_INSTRUCTION: Record<LongformMode, string> = {
  "zoom-in":
    "This is the ZOOM IN moment. Surface the mechanism underneath — the specific detail that changes how the reader thinks about how something actually works. End on that insight.",
  "zoom-out":
    "This is the ZOOM OUT moment. Help the reader see the bigger pattern this is part of. Connect it to broader themes in technology, leadership, or strategy.",
  inversion:
    "This is the INVERSION moment. Surface what's counterintuitive or what the consensus gets wrong. The last sentence should leave the reader thinking 'huh, I had that backwards'.",
};

export function buildSelectionPrompt(
  candidates: SectionCandidate[],
  n: number,
  section: MorningBriefSection,
  mode: LongformMode | undefined,
  personalCtx: string,
): string {
  const modeNote = mode ? `\nSection mode (${mode}): ${MODE_SELECTION_HINT[mode]}\n` : "";
  const candidateLines = candidates
    .map(
      (c) =>
        `[${c.id}] ${c.title} (${c.source}${c.score !== undefined ? `, score: ${c.score}` : ""})` +
        (c.snippet ? `\n    ${c.snippet.slice(0, 200)}` : ""),
    )
    .join("\n");

  return `You are curating a personalised morning brief.
Pick the ${n} most important and genuinely interesting article(s) for the "${section}" section from the candidates below.

Prioritise genuine significance and relevance to the reader's context over novelty or recency.
Where possible, pick diverse sources — avoid selecting more than one article from the same source unless the second is clearly more important.
${modeNote}
Personal context:
${personalCtx}

Candidates:
${candidateLines}

Respond with ONLY valid JSON — no explanation, no markdown:
{"picks":["id1"${n > 1 ? ',"id2"' : ""}]}`;
}

const SNIPPET_CONTENT_THRESHOLD = 500;

export function buildSummaryPrompt(
  title: string,
  source: string,
  url: string,
  content: string,
  mode: LongformMode | undefined,
  personalCtx: string,
): string {
  // Defensive path: when scraping yielded little/nothing, only the headline is
  // available. Tell Claude not to invent details — a thin honest summary beats
  // a confident hallucinated one.
  if (content.length < SNIPPET_CONTENT_THRESHOLD) {
    return `You are writing a personalised morning brief, but you ONLY have a brief headline/snippet for this article — the full content was not available.

Write 1–2 factual sentences referencing only what's in the snippet. Do NOT invent details, quotes, statistics, or context beyond what is explicitly stated. If the snippet is too thin to summarise meaningfully, say so honestly (e.g. "Headline only — full article unavailable.").

Personal context (for relevance, not for inventing content):
${personalCtx}

Article:
Title: ${title}
Source: ${source}
URL: ${url}

Snippet:
${content}`;
  }

  const modeInstruction = mode ? `\n${MODE_SUMMARY_INSTRUCTION[mode]}\n` : "";

  return `You are writing a personalised morning brief.
Write a tight, engaging 3-5 sentence summary of this article.
Be specific and concrete. Where relevant, explicitly connect the content to the reader's context below. No filler phrases. Write directly — no preamble or meta-commentary.
${modeInstruction}
Personal context:
${personalCtx}

Article:
Title: ${title}
Source: ${source}
URL: ${url}

Content:
${content.slice(0, 6000)}`;
}

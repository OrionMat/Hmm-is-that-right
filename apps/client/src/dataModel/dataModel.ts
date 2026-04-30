import type { ComponentType } from "react";

export type CardKind = "MCP" | "Skills" | "Commands" | "Context";

export const kindClasses: Record<CardKind, string> = {
  MCP: "text-kind-mcp",
  Skills: "text-kind-skills",
  Commands: "text-kind-commands",
  Context: "text-kind-context",
} as const;

export const kindSymbols: Record<CardKind, string> = {
  MCP: "[]",
  Skills: "*",
  Commands: ">_",
  Context: "()",
} as const;

/**
 * News piece
 * i.e {url: "www.bbc...", title: "Tea Pots", date: "01/01/2020", body: ["list", "of", "paragraphs"], source: "bbc"}
 */
export interface NewsPiece {
  url: string;
  title: string | null | undefined;
  date: string | null | undefined;
  body: Array<string | null | undefined>;
  source: string;
}

/**
 * News piece containing relevant information
 * i.e {url: "www.bbc...", title: "Tea Pots", date: "01/01/2020", mostSimilarSentence: "I am a sentence", mostSimilarParagraph: "I am several. Sentences..."}
 */
export interface RelevantNewsPiece {
  url: string;
  title: string | null | undefined;
  date: string | null | undefined;
  source: string;
  mostSimilarSentence: string;
  mostSimilarParagraph: string;
}

export interface NewsSource {
  source: string;
  url: string;
  isActive: boolean;
}

export interface PermanentNewsSources {
  bbc: string;
  nyt: string;
  ap: string;
  reuters: string;
  twitter: string;
  deeplearning: string;
  googlenewstech: string;
}

export const permanentSources: Readonly<PermanentNewsSources> = {
  bbc: "bbc",
  nyt: "nyt",
  ap: "ap",
  reuters: "reuters",
  twitter: "twitter",
  deeplearning: "deeplearning",
  googlenewstech: "googlenewstech",
};

/**
 * A news article with an LLM-generated bullet point summary
 */
export interface HeadlineSummary {
  source: string;
  url: string;
  title: string;
  date: string | null | undefined;
  summary: string[];
}

export const LLM_MODELS = [
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite (Free)" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gpt-4o-mini", label: "OpenAI GPT-4o-mini" },
] as const;

export type LlmModelId = (typeof LLM_MODELS)[number]["id"];

export const permanentSourceUrls: Readonly<PermanentNewsSources> = {
  bbc: "https://www.bbc.co.uk",
  nyt: "https://www.nyt.com",
  ap: "https://www.ap.com",
  reuters: "https://www.reuters.sa",
  twitter: "https://www.twitter.com",
  deeplearning: "https://www.deeplearning.ai/the-batch/",
  googlenewstech: "https://news.google.com/",
};

export interface IsActiveNewsSources {
  bbc: boolean;
  nyt: boolean;
  ap: boolean;
  reuters: boolean;
  twitter: boolean;
  deeplearning: boolean;
  googlenewstech: boolean;
}

// ─── Morning Brief ────────────────────────────────────────────────────────────

export type MorningBriefSection = "world" | "tech" | "longform";
export type LongformMode = "zoom-in" | "zoom-out" | "inversion";

export interface BriefItem {
  title: string;
  url: string;
  source: string;
  summary: string;
}

export interface SectionPayload {
  section: MorningBriefSection;
  mode?: LongformMode;
  items: BriefItem[];
  generatedAt: string;
}

/** SSE payload for a Stage-2 streaming token delta. */
export interface SummaryChunkPayload {
  section: MorningBriefSection;
  url: string;
  delta: string;
}

/** SSE payload signalling that a single item's summary has finished streaming. */
export interface SummaryDonePayload {
  section: MorningBriefSection;
  url: string;
}

export const SOURCE_KIND = {
  rss: "rss",
  hackernews: "hackernews",
  reddit: "reddit",
  paulgraham: "paulgraham",
} as const;
export type SourceKind = (typeof SOURCE_KIND)[keyof typeof SOURCE_KIND];

export const SOURCE_STATUS = {
  ok: "ok",
  failed: "failed",
  empty: "empty",
} as const;
export type SourceStatus = (typeof SOURCE_STATUS)[keyof typeof SOURCE_STATUS];

export const SCRAPE_OUTCOME = {
  scraped: "scraped",
  prefetched: "prefetched",
  snippetFallback: "snippet-fallback",
} as const;
export type ScrapeOutcome = (typeof SCRAPE_OUTCOME)[keyof typeof SCRAPE_OUTCOME];

export const SELECTION_METHOD = {
  llm: "llm",
  scoreFallback: "score-fallback",
  none: "none",
} as const;
export type SelectionMethod = (typeof SELECTION_METHOD)[keyof typeof SELECTION_METHOD];

/** Outcome of querying a single upstream source for a section. */
export interface SourceQueryResult {
  source: string;
  kind: SourceKind;
  status: SourceStatus;
  articlesReturned: number;
  error?: string;
}

/** A raw candidate article considered for Stage-1 selection. `picked` flags Stage-1 winners. */
export interface CandidateMeta {
  id: string;
  title: string;
  source: string;
  url: string;
  score?: number;
  picked: boolean;
}

export interface ScrapeAttempt {
  url: string;
  title: string;
  source: string;
  outcome: ScrapeOutcome;
  contentChars?: number;
}

export interface SectionDurations {
  fetchCandidatesMs: number;
  selectionMs: number;
  scrapingMs: number;
  summarisationMs: number;
  totalMs: number;
}

/** Behind-the-scenes report of how a section was built. */
export interface SectionDiagnostics {
  section: MorningBriefSection;
  mode?: LongformMode;
  cacheHit: boolean;
  llmModel: string;
  selectionMethod: SelectionMethod;
  personalContextUsed: boolean;
  sources: SourceQueryResult[];
  candidates: CandidateMeta[];
  scrapes: ScrapeAttempt[];
  durations: SectionDurations;
}

export interface CardData {
  name: string;
  handle: string;
  description: string;
  kinds: CardKind[];
  score: number;
  badge: string;
  accent?: string;
}

export interface PillData {
  label: string;
  icon?: ComponentType;
}

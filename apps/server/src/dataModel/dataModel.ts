/**
 * Object of sources with arrays of URLs for each source
 * i.e {bbc: ["www.bbc...", "www.bbc..."], nyt: ["www.nyt...", "www.nyt..."], ...}
 */
export interface SourceUrls {
  [source: string]: string[];
}

/**
 * Object of sources with URLs and webpages for each source
 * i.e {bbc: {urls: ["www.bbc...", "www.bbc..."], webpages: [bbcHTML, bbcHTML, ...]}, nyt: {urls: ["www.nyt...", "www.nyt..."], webpages: [...]}, ...}
 */
export interface SourcePages {
  [source: string]: { urls: string[]; webpages: string[] };
}

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

/**
 * A single article parsed from an RSS feed
 */
export interface RssArticle {
  url: string;
  title: string;
  date: string | null | undefined;
  description: string | null | undefined;
}

/**
 * A news article with an LLM-generated bullet point summary
 * i.e {source: "bbc", url: "www.bbc...", title: "Tea Pots", date: "01/01/2020", summary: ["Key point 1", "Key point 2"]}
 */
export interface HeadlineSummary {
  source: string;
  url: string;
  title: string;
  date: string | null | undefined;
  summary: string[];
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

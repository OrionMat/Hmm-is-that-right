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

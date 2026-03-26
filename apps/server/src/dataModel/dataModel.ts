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

// Shared types (NewsPiece, RelevantNewsPiece) live in apps/shared/dataModel.ts
// to avoid duplication with the client. Import them from there via this re-export.
export type { NewsPiece, RelevantNewsPiece } from "../../../shared/dataModel";

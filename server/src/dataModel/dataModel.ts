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
 * News pieces
 * @property bodies is an array of paragraphs for each news piece. i.e [[para1, para2, ...], [paraA, paraB, ...], ...]
 */
export interface NewsPieces {
  urls: Array<string>;
  titles: Array<string | null | undefined>;
  dates: Array<string | null | undefined>;
  authors: Array<string | null | undefined>;
  bodies: Array<Array<string | null | undefined>>;
}

/**
 * Object of sources with news piece data for each source
 * i.e {bbc: {titles: ["Tea Pots", "Flamingo Pineapples", ...], dates: ["01/01/2020", "02/02/2050", ...], ... }, nyt: {urls: ["www.nyt...", "www.nyt..."], dates: [...]}, ...}
 */
export interface SourcePieces {
  [source: string]: NewsPieces;
}

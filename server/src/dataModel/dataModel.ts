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
 * i.e {url: "www.bbc...", title: "Tea Pots", date: "01/01/2020"}, {body: ["list", "of", "paragraphs"]}
 */
export interface NewsPiece {
  url: string;
  title: string | null | undefined;
  date: string | null | undefined;
  body: Array<string | null | undefined>;
}

/**
 * Object of sources with news piece data for each source
 * i.e {bbc: [{url: "www.bbc...", title: "Tea Pots", date: "01/01/2020"}, {body: ["list", "of", "paragraphs"]}, nyt: [{...}, {...}, ], ...], ... }
 */
export interface NewsPieces {
  [source: string]: Array<NewsPiece>;
}

// SECTION --

// export interface NewsPiece {
//   title: string | null | undefined;
//   date: string | null | undefined;
//   author: string | null | undefined;
//   body: string;
//   link: string;
//   source: string;
// }

// export interface NewsSource {
//   source: string;
//   url: string;
//   isActive: boolean;
// }

// export interface PermanentNewsSources {
//   bbc: string;
//   nyt: string;
//   ap: string;
//   reuters: string;
//   twitter: string;
// }

// export const permanentSources: Readonly<PermanentNewsSources> = {
//   bbc: "bbc",
//   nyt: "nyt",
//   ap: "ap",
//   reuters: "reuters",
//   twitter: "twitter",
// };

// export const permanentSourceUrls: Readonly<PermanentNewsSources> = {
//   bbc: "https://www.bbc.co.uk",
//   nyt: "https://www.nyt.com",
//   ap: "https://www.ap.com",
//   reuters: "https://www.reuters.sa",
//   twitter: "https://www.twitter.com",
// };

// export interface IsActiveNewsSources {
//   bbc: boolean;
//   nyt: boolean;
//   ap: boolean;
//   reuters: boolean;
//   twitter: boolean;
// }

/**
 * News piece
 * i.e {url: "www.bbc...", title: "Tea Pots", date: "01/01/2020"}, {body: ["list", "of", "paragraphs"]}
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
}

export const permanentSources: Readonly<PermanentNewsSources> = {
  bbc: "bbc",
  nyt: "nyt",
  ap: "ap",
  reuters: "reuters",
  twitter: "twitter",
};

export const permanentSourceUrls: Readonly<PermanentNewsSources> = {
  bbc: "https://www.bbc.co.uk",
  nyt: "https://www.nyt.com",
  ap: "https://www.ap.com",
  reuters: "https://www.reuters.sa",
  twitter: "https://www.twitter.com",
};

export interface IsActiveNewsSources {
  bbc: boolean;
  nyt: boolean;
  ap: boolean;
  reuters: boolean;
  twitter: boolean;
}

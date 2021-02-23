export interface NewsPiece {
  title: string | null | undefined;
  date: string | null | undefined;
  author: string | null | undefined;
  body: string;
  link: string;
  source: string;
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

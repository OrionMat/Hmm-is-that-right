export interface SourceConfig {
  domainAllowlist: string[];
  selectors: {
    title: string[];
    date: string[];
    content: string[];
  };
}

export const sourceConfigs: Record<string, SourceConfig> = {
  bbc: {
    domainAllowlist: ["https://www.bbc."],
    selectors: {
      title: ["#main-heading", "h1"],
      date: ["time"],
      content: ["article p", "p"],
    },
  },
  nyt: {
    domainAllowlist: ["https://www.nytimes."],
    selectors: {
      title: ["h1"],
      date: ["time > span:first-child", "time"],
      content: ["section[name*='articleBody'] p", "p"],
    },
  },
  ap: {
    domainAllowlist: ["https://apnews."],
    selectors: {
      title: ["[data-key='card-headline'] > h1", "h1"],
      date: [
        "[data-key='timestamp'][class*='Timestamp']",
        "[data-key='timestamp']",
        "[class*='Timestamp']",
      ],
      content: [
        "[data-key='article'][class='Article'] p",
        "[data-key='article'] p",
        "[class='Article'] p",
        "p",
      ],
    },
  },
  reuters: {
    domainAllowlist: ["https://www.reuters."],
    selectors: {
      title: ["h1"],
      date: [
        "[class*='ArticleHeader-date'] > time:first-child",
        "time:first-child",
        "time",
      ],
      content: [
        "article[class*='ArticlePage'] p",
        "[class='ArticleBodyWrapper'] p",
        "p",
      ],
    },
  },
};

export const defaultSourceConfig: SourceConfig = {
  domainAllowlist: [],
  selectors: {
    title: ["h1"],
    date: ["time", "[class*='Timestamp']"],
    content: ["p"],
  },
};

export function getSourceConfig(source: string): SourceConfig {
  return sourceConfigs[source.toLowerCase()] ?? defaultSourceConfig;
}

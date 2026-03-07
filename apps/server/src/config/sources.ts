export interface SourceConfig {
  domainAllowlist: string[];
  excludePatterns: string[];
  selectors: {
    title: string[];
    date: string[];
    content: string[];
  };
}

export const sourceConfigs: Record<string, SourceConfig> = {
  bbc: {
    domainAllowlist: ["https://www.bbc."],
    excludePatterns: [],
    selectors: {
      title: ["#main-heading", "h1"],
      date: ["time"],
      content: ["article p", "p"],
    },
  },
  nyt: {
    domainAllowlist: ["https://www.nytimes."],
    excludePatterns: ["/interactive/"],
    selectors: {
      title: ["h1"],
      date: ["time > span:first-child", "time"],
      content: ["section[name*='articleBody'] p", "p"],
    },
  },
  ap: {
    domainAllowlist: ["https://apnews."],
    excludePatterns: ["/hub/", "/topic/"],
    selectors: {
      title: [
        "h1.PagePromo-title",
        ".Component-headline",
        "[data-key='card-headline'] > h1",
        "h1",
      ],
      date: [
        "bsp-timestamp",
        ".Timestamp-template",
        "[data-key='timestamp']",
        ".Timestamp",
      ],
      content: [
        ".RichTextStoryBody p",
        ".ArticleBody p",
        "article p",
        "div:not(.Page-footer-disclaimer) > p",
      ],
    },
  },
  reuters: {
    domainAllowlist: ["https://www.reuters."],
    excludePatterns: [],
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
  excludePatterns: [],
  selectors: {
    title: ["h1"],
    date: ["time", "[class*='Timestamp']"],
    content: ["p"],
  },
};

export function getSourceConfig(source: string): SourceConfig {
  return sourceConfigs[source.toLowerCase()] ?? defaultSourceConfig;
}

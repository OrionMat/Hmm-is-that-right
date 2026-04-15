/**
 * RSS feed URLs for each supported news source.
 * These return structured XML with the current top headlines.
 */
export const RSS_FEEDS: Record<string, string> = {
  bbc: "https://feeds.bbci.co.uk/news/rss.xml",
  nyt: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  ap: "https://feeds.apnews.com/rss/topnews",
  reuters: "https://feeds.reuters.com/reuters/topNews",
};

/** Number of articles to take from each RSS feed */
export const RSS_ARTICLES_PER_SOURCE = 5;

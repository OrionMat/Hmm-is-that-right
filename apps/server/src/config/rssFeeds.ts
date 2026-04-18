/**
 * RSS feed URLs for each supported news source.
 * These return structured XML with the current top headlines.
 */
export const RSS_FEEDS: Record<string, string> = {
  bbc: "https://feeds.bbci.co.uk/news/world/rss.xml",
  nyt: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  googlenewstech:
    "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
};

/** Number of articles to take from each RSS feed */
export const RSS_ARTICLES_PER_SOURCE = 5;

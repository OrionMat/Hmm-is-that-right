/**
 * RSS feed URLs for each supported news source.
 * These return structured XML with the current top headlines.
 */
export const RSS_FEEDS: Record<string, string> = {
  bbc: "https://feeds.bbci.co.uk/news/world/rss.xml",
  nyt: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  googlenewstech:
    "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
  // Morning Brief sources
  // Several major outlets have killed or moved their public RSS feeds.
  // Where the official feed is gone, we fall back to Google News site-filter,
  // which returns headline + short snippet (no full article content). The
  // snippet-aware summary prompt handles these gracefully.
  ap: "https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en",
  reuters: "https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en",
  theBatch:
    "https://news.google.com/rss/search?q=%22the+batch%22+site:deeplearning.ai&hl=en-US&gl=US&ceid=US:en",
  anthropicBlog: "https://news.google.com/rss/search?q=site:anthropic.com&hl=en-US&gl=US&ceid=US:en",
  githubBlog: "https://github.blog/feed/",
};

/** Number of articles to take from each RSS feed */
export const RSS_ARTICLES_PER_SOURCE = 5;

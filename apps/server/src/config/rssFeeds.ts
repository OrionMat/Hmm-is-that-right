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
  ap: "https://feeds.apnews.com/rss/apf-topnews",
  // Reuters killed their public RSS; falling back to Google News site-filter
  reuters: "https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en",
  theBatch: "https://www.deeplearning.ai/the-batch/feed/",
  anthropicBlog: "https://www.anthropic.com/rss.xml",
  githubBlog: "https://github.blog/feed/",
};

/** Number of articles to take from each RSS feed */
export const RSS_ARTICLES_PER_SOURCE = 5;

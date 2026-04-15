import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { getLogger } from "../../logger";
import { RssArticle } from "../../dataModel/dataModel";
import { RSS_FEEDS, RSS_ARTICLES_PER_SOURCE } from "../../config/rssFeeds";

const log = getLogger("integration/fetchRssFeed");

const FETCH_TIMEOUT_MS = 10000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const xmlParser = new XMLParser({ ignoreAttributes: false });

/**
 * Fetches and parses the RSS feed for a single source.
 * @param source The source key (e.g. "bbc")
 * @param feedUrl The RSS feed URL
 * @returns Array of RssArticle objects (up to RSS_ARTICLES_PER_SOURCE)
 */
async function fetchFeedForSource(
  source: string,
  feedUrl: string
): Promise<RssArticle[]> {
  log.debug({ source, feedUrl }, "Fetching RSS feed");

  const response = await axios.get(feedUrl, {
    timeout: FETCH_TIMEOUT_MS,
    headers: { "User-Agent": USER_AGENT },
    responseType: "text",
  });

  const parsed = xmlParser.parse(response.data);
  const items: any[] = parsed?.rss?.channel?.item ?? [];

  const articles: RssArticle[] = items
    .slice(0, RSS_ARTICLES_PER_SOURCE)
    .map((item) => ({
      url: item.link ?? item.guid ?? "",
      title: item.title ?? "",
      date: item.pubDate ?? null,
      description: item.description ?? null,
    }))
    .filter((article) => article.url && article.title);

  log.debug({ source, count: articles.length }, "Parsed RSS articles");
  return articles;
}

/**
 * Fetches RSS headlines for each selected source in parallel.
 * @param sources Array of source keys to fetch (e.g. ["bbc", "ap"])
 * @returns Map of source → RssArticle[]
 */
export async function fetchRssFeeds(
  sources: string[]
): Promise<Record<string, RssArticle[]>> {
  log.info(`Fetching RSS feeds for sources: ${sources.join(", ")}`);

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const feedUrl = RSS_FEEDS[source];
      if (!feedUrl) {
        log.warn({ source }, "No RSS feed configured for source, skipping");
        return { source, articles: [] };
      }
      const articles = await fetchFeedForSource(source, feedUrl);
      return { source, articles };
    })
  );

  const feedsBySource: Record<string, RssArticle[]> = {};
  let totalArticles = 0;

  results.forEach((result, index) => {
    const source = sources[index];
    if (result.status === "fulfilled") {
      feedsBySource[source] = result.value.articles;
      totalArticles += result.value.articles.length;
    } else {
      log.warn({ source, reason: result.reason?.message }, "Failed to fetch RSS feed");
      feedsBySource[source] = [];
    }
  });

  log.info({ sources, totalArticles }, "RSS feed fetch complete");
  return feedsBySource;
}

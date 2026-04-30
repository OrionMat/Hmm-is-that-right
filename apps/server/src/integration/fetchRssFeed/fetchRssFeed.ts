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

// Short-lived in-flight dedupe so concurrent requests for the same RSS source
// (e.g. Morning Brief's tech + longform sections both asking for theBatch)
// share a single HTTP fetch instead of hitting the upstream twice.
const INFLIGHT_TTL_MS = 30_000;
const inflight = new Map<string, { promise: Promise<RssArticle[]>; expiresAt: number }>();

interface RawRssItem {
  link?: string;
  guid?: string | { "#text"?: string };
  title?: string;
  pubDate?: string;
  description?: string;
}

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
  const items: RawRssItem[] = parsed?.rss?.channel?.item ?? [];

  const articles: RssArticle[] = items
    .slice(0, RSS_ARTICLES_PER_SOURCE)
    .map((item) => ({
      url: item.link ?? (typeof item.guid === "string" ? item.guid : item.guid?.["#text"]) ?? "",
      title: item.title ?? "",
      date: item.pubDate ?? null,
      description: item.description ?? null,
    }))
    .filter((article) => article.url && article.title);

  log.debug({ source, count: articles.length }, "Parsed RSS articles");
  return articles;
}

export interface RssFeedResult {
  source: string;
  articles: RssArticle[];
  status: "ok" | "failed" | "empty";
  error?: string;
}

/**
 * Fetches RSS headlines for each source in parallel, returning per-source status
 * alongside the articles. Used by the Morning Brief diagnostics pipeline.
 */
export async function fetchRssFeedsWithStatus(
  sources: string[]
): Promise<RssFeedResult[]> {
  log.info(`Fetching RSS feeds for sources: ${sources.join(", ")}`);

  const settled = await Promise.allSettled(
    sources.map(async (source) => {
      const feedUrl = RSS_FEEDS[source];
      if (!feedUrl) {
        log.warn({ source }, "No RSS feed configured for source, skipping");
        return { source, articles: [] as RssArticle[] };
      }
      const now = Date.now();
      const existing = inflight.get(source);
      let articles: RssArticle[];
      if (existing && existing.expiresAt > now) {
        log.debug({ source }, "Reusing in-flight RSS fetch");
        articles = await existing.promise;
      } else {
        const promise = fetchFeedForSource(source, feedUrl);
        inflight.set(source, { promise, expiresAt: now + INFLIGHT_TTL_MS });
        try {
          articles = await promise;
        } finally {
          // Clear immediately so a follow-up minutes later refetches; the dedupe
          // window only needs to cover a single brief run.
          inflight.delete(source);
        }
      }
      return { source, articles };
    })
  );

  const results: RssFeedResult[] = [];
  let totalArticles = 0;

  settled.forEach((result, index) => {
    const source = sources[index];
    if (result.status === "fulfilled") {
      const articles = result.value.articles;
      totalArticles += articles.length;
      results.push({
        source,
        articles,
        status: articles.length === 0 ? "empty" : "ok",
      });
    } else {
      const reason = (result.reason as Error | undefined)?.message ?? "unknown error";
      log.warn({ source, reason }, "Failed to fetch RSS feed");
      results.push({ source, articles: [], status: "failed", error: reason });
    }
  });

  log.info({ sources, totalArticles }, "RSS feed fetch complete");
  return results;
}

/**
 * Fetches RSS headlines for each selected source in parallel.
 * @param sources Array of source keys to fetch (e.g. ["bbc", "ap"])
 * @returns Map of source → RssArticle[]
 */
export async function fetchRssFeeds(
  sources: string[]
): Promise<Record<string, RssArticle[]>> {
  const results = await fetchRssFeedsWithStatus(sources);
  const feedsBySource: Record<string, RssArticle[]> = {};
  for (const { source, articles } of results) {
    feedsBySource[source] = articles;
  }
  return feedsBySource;
}

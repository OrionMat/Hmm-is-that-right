import axios from "axios";
import { JSDOM } from "jsdom";
import { getLogger } from "../../logger";
import { getSourceConfig, HomepageConfig } from "../../config/sources";
import { RSS_ARTICLES_PER_SOURCE } from "../../config/rssFeeds";

const log = getLogger("integration/scrapeHomepageUrls");

const FETCH_TIMEOUT_MS = 10000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Extracts article URLs from a homepage using the JSON-LD ItemList strategy.
 * Parses <script type="application/ld+json"> and reads mainEntity.itemListElement[].url.
 */
function extractUrlsViaJsonLd(
  dom: Document,
  articleUrlPattern: string | undefined
): string[] {
  const scripts = dom.querySelectorAll('script[type="application/ld+json"]');

  for (const script of Array.from(scripts)) {
    try {
      const data = JSON.parse(script.textContent ?? "");
      const items: Array<{ url?: string }> =
        data?.mainEntity?.itemListElement ?? [];

      const urls = items
        .map((item) => item.url ?? "")
        .filter((url) => {
          if (!url) return false;
          if (articleUrlPattern && !url.includes(articleUrlPattern)) return false;
          return true;
        });

      if (urls.length > 0) return urls;
    } catch {
      // Not a valid JSON-LD block — try the next script tag
    }
  }

  return [];
}

/**
 * Extracts article URLs from a homepage using a CSS selector strategy.
 * Queries for anchor elements and returns their href values.
 */
function extractUrlsViaCss(
  dom: Document,
  selector: string,
  articleUrlPattern: string | undefined
): string[] {
  const anchors = Array.from(dom.querySelectorAll(selector)) as HTMLAnchorElement[];

  return anchors
    .map((a) => a.href ?? a.getAttribute("href") ?? "")
    .filter((url) => {
      if (!url) return false;
      if (articleUrlPattern && !url.includes(articleUrlPattern)) return false;
      return true;
    });
}

/**
 * Fetches a source homepage and extracts the top headline article URLs.
 * Uses the strategy defined in the source's homepage config (json-ld or css).
 *
 * @param source The source key (e.g. "ap")
 * @param homepageConfig The homepage scraping config for the source
 * @returns Deduplicated array of article URLs, capped at RSS_ARTICLES_PER_SOURCE
 */
async function scrapeUrlsForSource(
  source: string,
  homepageConfig: HomepageConfig
): Promise<string[]> {
  log.debug({ source, url: homepageConfig.url }, "Fetching homepage");

  const response = await axios.get(homepageConfig.url, {
    timeout: FETCH_TIMEOUT_MS,
    headers: { "User-Agent": USER_AGENT },
    responseType: "text",
  });

  const dom = new JSDOM(response.data).window.document;

  let urls: string[];
  if (homepageConfig.strategy === "json-ld") {
    urls = extractUrlsViaJsonLd(dom, homepageConfig.articleUrlPattern);
  } else {
    urls = extractUrlsViaCss(
      dom,
      homepageConfig.selector ?? "a",
      homepageConfig.articleUrlPattern
    );
  }

  // Deduplicate and cap
  const unique = [...new Set(urls)].slice(0, RSS_ARTICLES_PER_SOURCE);
  log.debug({ source, found: urls.length, kept: unique.length }, "Homepage URLs extracted");
  return unique;
}

/**
 * Scrapes headline article URLs from source homepages for all sources
 * that have a homepage config defined. Sources without a homepage config
 * are skipped (they use RSS instead).
 *
 * @param sources Array of source keys to process
 * @returns Map of source → article URL[]
 */
export async function scrapeHomepageUrls(
  sources: string[]
): Promise<Record<string, string[]>> {
  const sourcesWithHomepage = sources.filter((source) => {
    const config = getSourceConfig(source);
    return !!config.homepage;
  });

  if (sourcesWithHomepage.length === 0) return {};

  log.info(`Scraping homepage URLs for sources: ${sourcesWithHomepage.join(", ")}`);

  const results = await Promise.allSettled(
    sourcesWithHomepage.map(async (source) => {
      const { homepage } = getSourceConfig(source);
      const urls = await scrapeUrlsForSource(source, homepage!);
      return { source, urls };
    })
  );

  const urlsBySource: Record<string, string[]> = {};
  let total = 0;

  results.forEach((result, index) => {
    const source = sourcesWithHomepage[index];
    if (result.status === "fulfilled") {
      urlsBySource[source] = result.value.urls;
      total += result.value.urls.length;
    } else {
      log.warn({ source, reason: result.reason?.message }, "Failed to scrape homepage");
      urlsBySource[source] = [];
    }
  });

  log.info({ total }, "Homepage URL scraping complete");
  return urlsBySource;
}

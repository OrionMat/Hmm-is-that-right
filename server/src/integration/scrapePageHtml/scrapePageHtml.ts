import axios from "axios";
import { getLogger } from "../../logger";
import { SourceUrls, SourcePages } from "../../dataModel/dataModel";

const log = getLogger("integration/scrapePageHtml");

const SCRAPE_TIMEOUT_MS = 10000; // 10 seconds
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Scrapes webpage HTML for each URL
 * @param sourceUrls Sources with a list of URls for each source. i.e {bbc: ["www.bbc...", "www.bbc..."], nyt: ["www.nyt...", "www.nyt..."], ...}
 * @returns webpages and URLs for each source. i.e {bbc: {urls: ["www.bbc...", "www.bbc..."], webpages: [bbcHTML, bbcHTML, ...]}, nyt: {urls: ["www.nyt...", "www.nyt..."], webpages: [...]}, ...}
 */
export async function scrapePageHtml(
  sourceUrls: SourceUrls
): Promise<SourcePages> {
  log.info(`Scraping page HTML for news sources ${JSON.stringify(Object.keys(sourceUrls))}`);

  const sourceEntries = Object.entries(sourceUrls);
  
  // Process all sources in parallel
  const results = await Promise.all(
    sourceEntries.map(async ([source, urls]) => {
      log.debug({ source, urlCount: urls.length }, "Starting scrape for source");
      
      const webpages: string[] = [];
      let scraped = 0;
      let failed = 0;

      // Concurrent http requests for URLs within this source
      const promisedResults = urls.map((url) => 
        axios.get(url, {
          timeout: SCRAPE_TIMEOUT_MS,
          headers: { "User-Agent": USER_AGENT },
          // Don't throw on non-2xx to handle them gracefully in allSettled
          validateStatus: () => true 
        })
      );

      const rawResults = await Promise.allSettled(promisedResults);

      rawResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.status === 200) {
          webpages.push(result.value.data);
          scraped += 1;
        } else {
          failed += 1;
          const url = urls[index];
          const reason = result.status === "rejected" ? result.reason.message : `Status ${result.value.status}`;
          log.warn({ source, url, reason }, "Failed to scrape URL");
        }
      });

      return { source, webpages, urls, scraped, failed };
    })
  );

  const sourcePages: SourcePages = {};
  let totalAttempted = 0;
  let totalScraped = 0;
  let totalFailed = 0;

  results.forEach(({ source, webpages, urls, scraped, failed }) => {
    sourcePages[source] = { webpages, urls };
    totalAttempted += urls.length;
    totalScraped += scraped;
    totalFailed += failed;
  });

  log.info(
    { totalAttempted, totalScraped, totalFailed },
    "Scrape page metrics"
  );
  log.info("Successfully scraped HTML for news sources.");
  return sourcePages;
}

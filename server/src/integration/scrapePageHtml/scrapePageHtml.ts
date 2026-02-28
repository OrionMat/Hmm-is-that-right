import axios from "axios";
import { getLogger } from "../../logger";
import { SourceUrls, SourcePages } from "../../dataModel/dataModel";

const log = getLogger("integration/scrapePageHtml");

/**
 * Scrapes webpage HTML for each URL
 * @param sourceUrls Sources with a list of URls for each source. i.e {bbc: ["www.bbc...", "www.bbc..."], nyt: ["www.nyt...", "www.nyt..."], ...}
 * @returns webpages and URLs for each source. i.e {bbc: {urls: ["www.bbc...", "www.bbc..."], webpages: [bbcHTML, bbcHTML, ...]}, nyt: {urls: ["www.nyt...", "www.nyt..."], webpages: [...]}, ...}
 */
export async function scrapePageHtml(
  sourceUrls: SourceUrls
): Promise<SourcePages> {
  log.info(`Scraping page HTML for news sources ${JSON.stringify(sourceUrls)}`);

  const sourcePages: SourcePages = {};
  let attemptedPages = 0;
  let scrapedPages = 0;
  let failedPages = 0;
  try {
    for (const source in sourceUrls) {
      const urls = sourceUrls[source];
      attemptedPages += urls.length;

      // concurrent http requests. i.e promisedResults = [promise1, promise2, ...]
      const promisedResults = urls.map((url) => axios.get(url));
      log.debug(`Made axios requests for web pages`);

      // resolve all http request promises. i.e results = [response1, response2, ...]
      const rawResults = await Promise.allSettled(promisedResults);
      log.debug(`Resolved all request results`);

      // get html response data. i.e data = [webPage1, webPage2, ...]
      const webpages: string[] = [];
      rawResults.forEach((result) => {
        if (result.status === "fulfilled") {
          webpages.push(result.value.data);
          scrapedPages += 1;
        } else {
          failedPages += 1;
        }
      });

      sourcePages[source] = { webpages, urls };
    }
  } catch (error) {
    log.error({ error }, "Error scraping webpages");
  }

  log.info(
    { attemptedPages, scrapedPages, failedPages },
    "Scrape page metrics"
  );
  log.info("Successfully scraped HTML for news sources.");
  return sourcePages;
}

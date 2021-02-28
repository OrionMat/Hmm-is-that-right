import axios from "axios";
import { SourceUrls, SourcePages } from "../dataModel/dataModel";

/**
 * Scrapes webpage HTML for each URL
 * @param sourceUrls Sources with a list of URls for each source. i.e {bbc: ["www.bbc...", "www.bbc..."], nyt: ["www.nyt...", "www.nyt..."], ...}
 * @returns webpages and URLs for each source. i.e {bbc: {urls: ["www.bbc...", "www.bbc..."], webpages: [bbcHTML, bbcHTML, ...]}, nyt: {urls: ["www.nyt...", "www.nyt..."], webpages: [...]}, ...}
 */
export const scrapePageHtml = async (sourceUrls: SourceUrls) => {
  console.log("scraping page HTML.");
  let results: SourcePages = {};
  try {
    for (const source in sourceUrls) {
      const urls = sourceUrls[source];

      // concurrent http requests. i.e promisedResults = [promise1, promise2, ...]
      const promisedResults = urls.map((url) => axios.get(url));

      // resolve all http request promises. i.e results = [response1, response2, ...]
      const rawResults = await Promise.all(promisedResults);

      // get html response data. i.e data = [webPage1, webPage2, ...]
      const webpages = rawResults.map((result) => result.data as string);

      results[source].webPages = webpages;
      results[source].urls = urls;
    }
  } catch (error) {
    console.error(error);
  }
  return results;
};

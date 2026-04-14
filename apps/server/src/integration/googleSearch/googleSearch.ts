/** searches google for statement */
import axios from "axios";
import { getLogger } from "../../logger";
import { serverConfig } from "../../config/serverConfig";
import { SourceUrls } from "../../dataModel/dataModel";

const log = getLogger("integration/googleSearch");

const SEARCH_CACHE_MAX = 500;
const searchCache = new Map<string, { data: SourceUrls; expiry: number }>();

/** Clears the search cache. Exported for use in tests. */
export function clearSearchCache(): void {
  searchCache.clear();
}

/**
 * Searches Google for the query statement and returns the top result URLs. 125 credits with SERP google search library
 * @param statement Statement to be fact checked
 * @param sources Sources to cross check statement with
 * @returns Array of URLS for each source. i.e {bbc: ["www.bbc...", "www.bbc..."], nyt: ["www.nyt...", "www.nyt..."], ...}
 */
export async function googleSearch(
  statement: string,
  sources: string[]
): Promise<SourceUrls> {
  log.info(
    `Google searching news sources: ${sources}. With statement: ${statement}`
  );

  const key = `${statement.trim().toLowerCase()}:${[...sources].sort().join(",")}`;
  const cached = searchCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    log.info({ key }, "googleSearch: cache hit");
    return cached.data;
  }

  // build array of search queries. i.e ["bbc + Kenya win 7s", "nyt + Kenya win 7s"]
  const queries = sources.map((source) => `${source} + ${statement}`);

  // set up list of request parameters
  const paramsList = queries.map((query) => ({
    api_key: serverConfig.serpSearchApiKey,
    q: query, // The search query
    engine: "google", // Specify the search engine
    num: 10, // Request 5 results
    gl: "us", // Google location parameter (country)
    hl: "en", // Host language parameter
  }));

  let sourceUrls: SourceUrls = {};
  try {
    // make the http GET request to Scale SERP
    const rawResults = paramsList.map((params) =>
      axios.get("https://serpapi.com/search", {
        params,
      })
    );
    log.debug(`Made get request to Google`);

    // resolve all promised search results
    const rawDataList = (await Promise.allSettled(rawResults)).map((result) =>
      result.status === "fulfilled" ? result.value.data : undefined
    );
    log.trace(`Resolved search results ${JSON.stringify(rawDataList)}`);

    // map raw data to arrays of urls for each news source
    sources.forEach((source, index) => {
      if (rawDataList[index]) {
        const results = rawDataList[index].organic_results;
        const urls: string[] = results.map((result: any) => result.link);
        sourceUrls[source] = urls;
      }
    });
  } catch (error) {
    log.error(`Error searching Google: ${JSON.stringify(error)}`);
    throw new Error(`Searching Google: ${error}`);
  }

  if (searchCache.size >= SEARCH_CACHE_MAX) {
    // FIFO eviction: delete the oldest inserted entry
    searchCache.delete(searchCache.keys().next().value as string);
  }
  searchCache.set(key, { data: sourceUrls, expiry: Date.now() + serverConfig.googleCacheTtlMs });
  log.info(`URLs found: ${JSON.stringify(sourceUrls)}`);
  return sourceUrls;
}

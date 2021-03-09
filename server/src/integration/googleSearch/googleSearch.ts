/** searches google for statement */
import axios from "axios";
import { serverConfig } from "../../config/serverConfig";
import { SourceUrls } from "../../dataModel/dataModel";

/**
 * Searches Google for the query statement and returns the top result URLs. 125 credits with SERP google search library
 * @param statement Statement to be fact checked
 * @param sources Sources to cross check statement with
 * @returns Array of URLS for each source. i.e {bbc: ["www.bbc...", "www.bbc..."], nyt: ["www.nyt...", "www.nyt..."], ...}
 */
export const googleSearch = async (
  statement: string,
  sources: string[]
): Promise<SourceUrls> => {
  console.log(`Searching news sources for statement: ${statement}`);

  // build array of search queries. i.e ["bbc + Kenya win 7s", "nyt + New York best summer"]
  const queries = sources.map((source) => `${source} + ${statement}`);

  // set up list of request parameters
  const paramsList = queries.map((query) => ({
    api_key: serverConfig.serpSearchApiKey,
    q: query,
  }));

  let sourceUrls: SourceUrls = {};
  try {
    // make the http GET request to Scale SERP
    const rawResults = paramsList.map((params) =>
      axios.get("https://api.scaleserp.com/search", {
        params,
      })
    );

    // resolve all promised search results
    const rawDataList = (await Promise.all(rawResults)).map(
      (result) => result.data
    );

    // map raw data to arrays of urls for each news source
    sources.forEach((source, index) => {
      const results = rawDataList[index].organic_results;
      const urls = results.map((result: any) => result.link);
      sourceUrls[source] = urls;
    });
  } catch (error) {
    console.log("Error searching Google: ", error);
    throw new Error(`Searching Google: ${error}`);
  }
  console.log("urls found for:", JSON.stringify(sourceUrls));
  return sourceUrls;
};

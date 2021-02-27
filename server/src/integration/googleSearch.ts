/** searches google for statement */
import axios from "axios";
import serverConfig from "../config/serverConfig";

/**
 * Searches Google for the query statement and returns the top result URLs. 125 credits with SERP google search library
 * @param queries Array of search queries. i.e ["bbc + Kenya win 7s", "nyt + New York best summer"]
 * @returns Array of URLS for each source. i.e [["www.bbc...", "www.bbc..."], ["www.nyt...", "www.nyt..."], ...]
 */
export const googleSearch = async (queries: string[]): Promise<string[][]> => {
  // set up list of request parameters
  const paramsList = queries.map((query) => ({
    api_key: serverConfig.serpSearchApiKey,
    q: query,
  }));
  console.log("Request parameters: ", paramsList);

  let linksArrays: string[][] = [];
  try {
    // make the http GET request to Scale SERP
    const rawResults = paramsList.map((params) =>
      axios.get("https://api.scaleserp.com/search", {
        params,
      })
    );

    const rawDataList = (await Promise.all(rawResults)).map(
      (result) => result.data
    );
    linksArrays = rawDataList.map((rawData) => {
      const results = rawData.organic_results;
      const links = results.map((result: any) => result.link);
      return links;
    });
  } catch (error) {
    console.error(error);
  }
  console.log("links found:", linksArrays);
  return linksArrays;
};

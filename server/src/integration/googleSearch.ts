/** searches google for statement */
import axios from "axios";
import serverConfig from "../config/serverConfig";

/**
 * searches Google for the statement and returns the top links
 * 125 credits with SERP google search library
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

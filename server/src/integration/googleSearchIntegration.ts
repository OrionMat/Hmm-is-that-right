/** searches google for statement */
import axios from "axios";
import serverConfig from "../config/serverConfig";

/**
 * searches Google for the statement and returns the top links
 * 125 credits with SERP google search library
 */
export const googleSearchIntegration = async (
  queries: string[]
): Promise<string[][] | null> => {
  // set up list of request parameters
  const paramsList = queries.map((query) => ({
    api_key: serverConfig.serpSearchApiKey,
    q: query,
  }));
  console.log("Request parameters: ", paramsList);

  // make the http GET request to Scale SERP
  const rawResults = paramsList.map((params) =>
    axios.get("https://api.scaleserp.com/search", {
      params,
    })
  );

  let linksArray: string[][] | null = null;
  try {
    const rawDataList = (await Promise.all(rawResults)).map((res) => res.data);
    // console.log("rawDataList is", rawDataList); // remove
    linksArray = rawDataList.map((rawData) => {
      // console.log("rawData is", rawData); // remove
      const results = rawData.organic_results;
      const urls = results.map((result: any) => result.link);
      console.log("urls are", urls); // remove
      return urls;
    });
  } catch (error) {
    console.error(error);
  }
  console.log("links found:", linksArray);
  return linksArray;
};

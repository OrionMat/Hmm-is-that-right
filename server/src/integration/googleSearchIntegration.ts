/** searches google for statement */
import axios from "axios";
import serverConfig from "../config/serverConfig";

/**
 * searches Google for the statement and returns the top links
 * 125 credits with SERP google search library
 */
const googleSearchIntegration = async (query: string): Promise<string[]> => {
  // set up the request parameters
  const params = {
    api_key: serverConfig.serpSearchApiKey,
    q: query,
  };
  console.log("Request parameters: ", params);

  // make the http GET request to Scale SERP
  const resultsRaw = (
    await axios.get("https://api.scaleserp.com/search", {
      params,
    })
  ).data;

  const links: string[] = resultsRaw.organic_results.map(
    (result: any) => result.link
  );
  console.log(`links found: ${links}`);
  return links;
};

export default googleSearchIntegration;

/** scrapes news pieces from news sources on the internet */
import { error } from "console";
import { googleSearchIntegration } from "../integration/googleSearchIntegration";
import { scrapePageHtml } from "../integration/scrapePageHtml";
import { cleanLinks } from "./cleaningService";
import { mappingService } from "./mappingService";

export const getNewsService = async (statement: string, sources: string[]) => {
  console.log(
    `scrapeNewsPieceService for sources "${sources}" with statement: "${statement}"`
  );

  // search internet for statement
  const queries = sources.map((source) => `${source} + ${statement}`);
  const rawLinksArrays = await googleSearchIntegration(queries);

  // clean links, limit them
  const linksArrays = await cleanLinks(sources, rawLinksArrays);

  // scrape related web pages
  const rawPageArrays = await scrapePageHtml(linksArrays);

  // parse html web pages
  let newsPieces = await mappingService(sources, linksArrays, rawPageArrays);

  return newsPieces;
};

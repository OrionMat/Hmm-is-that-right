/** scrapes news pieces from news sources on the internet */
import { googleSearch } from "./integration/googleSearch";
import { scrapePageHtml } from "./integration/scrapePageHtml";
import { cleanUrls } from "./service/cleanUrls";
import { parseHtml } from "./service/parseHtml";

export const getNewsService = async (statement: string, sources: string[]) => {
  console.log(
    `scrapeNewsPieceService for sources "${sources}" with statement: "${statement}"`
  );

  // search internet for statement
  const queries = sources.map((source) => `${source} + ${statement}`);
  const rawLinksArrays = await googleSearch(queries);

  // clean links, limit them
  const linksArrays = await cleanUrls(sources, rawLinksArrays);

  // scrape related web pages
  const rawPageArrays = await scrapePageHtml(linksArrays);

  // parse html web pages
  let newsPieces = await parseHtml(sources, linksArrays, rawPageArrays);

  return newsPieces;
};

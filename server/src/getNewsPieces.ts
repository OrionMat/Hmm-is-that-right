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
  const rawUrlArrays = await googleSearch(queries);

  // clean URLS and limit their number
  const urlArrays = await cleanUrls(sources, rawUrlArrays);

  // scrape related web pages
  const htmlWebPageArrays = await scrapePageHtml(urlArrays);

  // parse html web pages
  let newsPieces = await parseHtml(sources, urlArrays, htmlWebPageArrays);

  return newsPieces;
};

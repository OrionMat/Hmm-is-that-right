/** scrapes news pieces from internet news sources */
import { googleSearch } from "../integration/googleSearch/googleSearch";
import { scrapePageHtml } from "../integration/scrapePageHtml/scrapePageHtml";
import { cleanUrls } from "./cleanUrls/cleanUrls";
import { parseHtml } from "./parseHtml";

// TODO test throughy. Add unit test for each function
// TODO make immutable data flow. Currently have to many objects referencing the same locations in memory
// TODO add extraction of most similar sentences/paragraphs

/**
 * Gets news pieces that can be used to cross check a statement.
 * @param statement Statement to be fact checked
 * @param sources Sources to cross check statement with
 */
export const getNewsPieces = async (statement: string, sources: string[]) => {
  console.log(
    `scrapeNewsPieceService for sources "${sources}" with statement: "${statement}"`
  );

  // search internet for source and statement
  const rawSourceUrls = await googleSearch(statement, sources);

  // clean URLS and limit their number
  const sourceUrls = await cleanUrls(rawSourceUrls);

  // scrape related web pages
  const sourcePages = await scrapePageHtml(sourceUrls);

  // parse html web pages
  const sourcePieces = await parseHtml(sourcePages);

  return sourcePieces;
};

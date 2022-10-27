/** scrapes news pieces from internet news sources */
import { googleSearch } from "../integration/googleSearch/googleSearch";
import { scrapePageHtml } from "../integration/scrapePageHtml/scrapePageHtml";
import { cleanUrls } from "./cleanUrls/cleanUrls";
import { parseHtml } from "./parseHtml/parseHtml";
import { NewsPiece } from "../dataModel/dataModel";
import { getLogger } from "../logger";

const log = getLogger("services/getNewsPieces");

/**
 * Gets news pieces that can be used to cross check a statement.
 * @param statement Statement to be fact checked
 * @param sources Sources to cross check statement with
 */
export async function getNewsPieces(
  statement: string,
  sources: string[]
): Promise<NewsPiece[]> {
  log.info(
    `Getting news pieces from sources: ${sources}. For statement: ${statement}`
  );

  // search internet for source and statement
  const rawSourceUrls = await googleSearch(statement, sources);

  // clean URLS and limit their number
  const sourceUrls = cleanUrls(rawSourceUrls);

  // scrape related web pages
  const sourcePages = await scrapePageHtml(sourceUrls);

  // parse html web pages
  const newsPieces = parseHtml(sourcePages);

  log.info(`Successfully got news pieces: ${JSON.stringify(newsPieces)}`);
  return newsPieces;
}

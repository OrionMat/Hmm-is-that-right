/** scrapes news pieces from internet news sources */
import { googleSearch } from "../integration/googleSearch/googleSearch";
import { scrapePageHtml } from "../integration/scrapePageHtml/scrapePageHtml";
import { cleanUrls } from "./cleanUrls/cleanUrls";
import { parseHtmlWithMetrics } from "./parseHtml/parseHtml";
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
  sources: string[],
  context?: { requestId?: string }
): Promise<NewsPiece[]> {
  log.info(
    `Getting news pieces from sources: ${sources}. For statement: ${statement}`
  );

  // search internet for source and statement
  const rawSourceUrls = await googleSearch(statement, sources);
  const urlsFound = Object.values(rawSourceUrls).reduce(
    (total, urls) => total + urls.length,
    0
  );

  // clean URLS and limit their number
  const sourceUrls = cleanUrls(rawSourceUrls);
  const urlsKept = Object.values(sourceUrls).reduce(
    (total, urls) => total + urls.length,
    0
  );

  // scrape related web pages
  const sourcePages = await scrapePageHtml(sourceUrls);
  const pagesScraped = Object.values(sourcePages).reduce(
    (total, sourcePage) => total + sourcePage.webpages.length,
    0
  );

  // parse html web pages
  const { newsPieces, metrics: parseMetrics } = parseHtmlWithMetrics(sourcePages);

  // TODO: find most similar sentence/paragraph to display to the user
  // i.e call addSimilarText, or computeSentenceSimilarities functions (still works in progress)

  const requestSummary = {
    requestId: context?.requestId ?? "unknown",
    statement,
    sourceCount: sources.length,
    urlsFound,
    urlsKept,
    pagesScraped,
    parseSuccesses: parseMetrics.parsedPages,
    parseFailures: parseMetrics.failedPages,
    newsPiecesReturned: newsPieces.length,
  };
  log.info(
    requestSummary,
    "GetNewsPieces request summary"
  );
  log.info("Successfully got news pieces");
  log.trace(`Retrieved news pieces: ${JSON.stringify(newsPieces)}`);
  return newsPieces;
}

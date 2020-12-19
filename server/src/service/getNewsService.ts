/** scrapes news pieces from news sources on the internet */
import { error } from "console";
import { googleSearchIntegration } from "../integration/googleSearchIntegration";
import { scrapePageHtml } from "../integration/scrapePageHtml";
import { mapRawPages, NewsPiece } from "./mappingService";

export const getNewsService = async (requestBody: {
  statement: string;
  sources: string[];
}) => {
  const statement = requestBody.statement;
  const sources = requestBody.sources;
  console.log(
    `scrapeNewsPieceService for sources "${sources}" with statement: "${statement}"`
  );

  // search internet for statement
  const queries = sources.map((source) => `${source} + ${statement}`);
  const linksArrays = [
    [
      "https://www.bbc.co.uk/news/world-us-canada-55193939",
      "https://www.bbc.co.uk/news/uk-politics-55191436",
    ],
    [
      "https://uk.reuters.com/article/health-coronavirus-snapshot/what-you-need-to-know-about-the-coronavirus-right-now-idUKVIRUS1",
      "https://uk.reuters.com/article/uk-britain-sterling/sterling-drops-from-two-and-a-half-year-high-as-brexit-talks-paused-idUKKBN28E134",
    ],
    [
      "https://www.nytimes.com/2020/11/15/us/politics/trump-concession-books-literature-.html",
      "https://www.nytimes.com/2020/11/07/us/politics/joe-biden-president.html",
    ],
    [
      "https://apnews.com/article/coronavirus-aid-bill-congress-08974a416131377d846d7b5b8583d250",
    ],
  ]; // await googleSearchIntegration(queries);

  // TODO: clean links, limit them
  // const linksArrays = cleanLinks(sources, rawLinksArrays)

  // scrape related web pages
  const rawPageArrays = await scrapePageHtml(linksArrays);
  if (!rawPageArrays) throw new Error("No html pages have been scraped");

  // parse html web pages
  let newsPieces: NewsPiece[] = [];
  for (let i = 0, end = sources.length; i < end; i++) {
    const newsPieceArray = await mapRawPages(
      sources[i],
      linksArrays[i],
      rawPageArrays[i]
    );
    newsPieces = newsPieces.concat(newsPieceArray);
  }

  return newsPieces;
};

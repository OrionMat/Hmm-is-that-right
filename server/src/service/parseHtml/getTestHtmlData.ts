/** gets HTML webpages and writes them to the sourcePages JSON file to provide parseHtml.test.ts with real test data */
import { writeFile } from "fs";
import { scrapePageHtml } from "../../integration/scrapePageHtml/scrapePageHtml";

/**
 * calls scrapePageHtml with live URLs to get real HTML webpages and writes them to the sourcePages.json file which is used in unit testing
 * NOTE: This does not need to be run again and if the online articles change running it again could mess up the unit tests
 */
export const getTestHtmlData = async () => {
  const sourceUrls = await scrapePageHtml({
    bbc: ["https://www.bbc.co.uk/news/science-environment-56377567"],
    nyt: [
      "https://www.nytimes.com/2021/03/08/science/math-crumple-fragmentation-andrejevic.html",
      "https://www.nytimes.com/2018/06/18/nyregion/et-doesnt-like-the-bike-path-either.html",
    ],
    ap: ["https://apnews.com/article/7d86ffc9a7737e8f7b98a0492f850589"],
    reuters: [
      "https://www.reuters.com/article/us-spain-chess-queens-gambit/spanish-chess-board-sales-soar-after-queens-gambit-cameo-idUSKBN2AG0VJ",
    ],
  });

  writeFile(
    "src/service/parseHtml/sourcePages.json",
    JSON.stringify(sourceUrls),
    (err) => {
      if (err) throw err;
      console.log("Test data saved!");
    }
  );
};

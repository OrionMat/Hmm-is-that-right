/** pulls out relevant news article information from the soup of html returned by the website */
import { JSDOM } from "jsdom";
import { SourcePages, NewsPiece } from "../../dataModel/dataModel";

/**
 * Get CSS selectors for title, date and content.
 * Multiple selectors are provided due to dom differences within the same source.
 * Most specific selectors should be fist in the arrays and more generic last.
 * @param source News source
 * @returns CSS selectors for title, date and content
 */
const getSelectors = (source: string) => {
  switch (source.toLowerCase()) {
    case "bbc":
      return {
        titleSelectors: ["#main-heading", "h1"],
        dateSelectors: ["time"],
        contentSelectors: ["article p", "p"],
      };
    case "nyt":
      return {
        titleSelectors: ["h1"],
        dateSelectors: ["time > span:first-child", "time"],
        contentSelectors: ["section[name*='articleBody'] p", "p"],
      };
    case "ap":
      return {
        titleSelectors: ["[data-key='card-headline'] > h1", "h1"],
        dateSelectors: [
          "[data-key='timestamp'][class*='Timestamp']",
          "[data-key='timestamp']",
          "[class*='Timestamp']",
        ],
        contentSelectors: [
          "[data-key='article'][class='Article'] p",
          "[data-key='article'] p",
          "[class='Article'] p",
          "p",
        ],
      };
    case "reuters":
      return {
        titleSelectors: ["h1"],
        // NOTE: could look at getting publishedDate with "meta[name*='REVISION_DATE']"
        dateSelectors: [
          "[class*='ArticleHeader-date'] > time:first-child",
          "time:first-child",
          "time",
        ],
        contentSelectors: [
          "article[class*='ArticlePage'] p",
          "[class='ArticleBodyWrapper'] p",
          "p",
        ],
      };
    default:
      return {
        titleSelectors: ["h1"],
        dateSelectors: ["time", "class*='Timestamp'"],
        contentSelectors: ["p"],
      };
  }
};

/**
 * Extract information from webpage
 * @param dom The parsed HTML webpage
 * @param selectors The CSS selector to extract information
 * @param source The news source
 */
const extractNewsInfo = (
  dom: Document,
  selectors: string[],
  source: string
) => {
  for (const selector of selectors) {
    const targetContent = dom.querySelector(selector)?.textContent;
    if (targetContent) return targetContent;
  }
  console.log(
    "target content not found for source:",
    source,
    ", with information selectors:",
    selectors
  );
  return null;
};

/**
 * Extract article body from webpage
 * @param dom The parsed HTML webpage
 * @param contentSelectors The CSS selector to extract body content
 * @param source The news source
 */
const extractNewsBody = (
  dom: Document,
  contentSelectors: string[],
  source: string
) => {
  // extract news piece body with most a (hopefully) valid selector
  let htmlParagraphs: NodeListOf<Element> | null = null;
  for (const selector of contentSelectors) {
    const targetContent = dom.querySelectorAll(selector);
    if (targetContent) {
      htmlParagraphs = targetContent;
      break;
    }
  }
  const paragraphs: Array<string | null> = [];
  htmlParagraphs?.forEach((element) => paragraphs.push(element.textContent));

  if (!htmlParagraphs)
    console.log(
      "target content not found for source:",
      source,
      ", with content selectors:",
      contentSelectors
    );
  return paragraphs;
};

/**
 * Parses HTML webpages and extracts relevant information
 * @param sourcePages HTML webpages and URLs for each source. i.e {bbc: {urls: ["www.bbc...", "www.bbc..."], webpages: [bbcHTML, bbcHTML, ...]}, nyt: {urls: ["www.nyt...", "www.nyt..."], webpages: [...]}, ...}
 * @returns Array of news pieces. i.e [{source: "bbc", url: "www.bbc...", title: "fancy title", date: "silly date", body: ["list", "of", "paragraphs"]}, {source: "nyt", ...}, ...]
 */
export const parseHtml = async (
  sourcePages: SourcePages
): Promise<NewsPiece[]> => {
  let newsPieces: NewsPiece[] = [];
  for (const source in sourcePages) {
    const urls = sourcePages[source].urls;
    const htmlPages = sourcePages[source].webpages;

    // get CSS selectors to find the news piece title, date and content
    const { titleSelectors, dateSelectors, contentSelectors } = getSelectors(
      source
    );

    // for each html page extract the relevant news article information and push it into the empty array for that source
    htmlPages.forEach((htmlPage, pageIndex) => {
      try {
        const dom = new JSDOM(htmlPage).window.document;

        const url = urls[pageIndex];
        const title = extractNewsInfo(dom, titleSelectors, source);
        const date = extractNewsInfo(dom, dateSelectors, source);
        const paragraphs = extractNewsBody(dom, contentSelectors, source);

        newsPieces.push({ url, title, date, body: paragraphs, source });
      } catch (error) {
        console.log("Error parsing webpage HTML: ", error);
      }
    });
  }

  return newsPieces;
};

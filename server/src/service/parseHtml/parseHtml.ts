import { JSDOM } from "jsdom";
import { SourcePages, SourcePieces } from "../../dataModel/dataModel";

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
      return [["#main-heading", "h1"], ["time"], ["article p", "p"]];
    case "nyt":
      return [
        ["h1"],
        ["time > span:first-child", "time"],
        ["section[name*='articleBody'] p", "p"],
      ];
    case "reuters":
      return [
        ["h1"],
        [
          "[class*='ArticleHeader-date'] > time:first-child",
          "time:first-child",
          // TODO: "meta[name*='REVISION_DATE']",
        ],
        [
          "article[class*='ArticlePage'] p",
          "[class='ArticleBodyWrapper'] p",
          "p",
        ],
      ];
    default:
      return [["h1"], ["time"], ["p"]];
  }
};

/**
 * Extract information from webpage
 * @param dom The parsed HTML webpage
 * @param selectors The CSS selector to extract information
 */
const extractNewsInfo = (dom: Document, selectors: string[]) => {
  for (const selector of selectors) {
    const targetContent = dom.querySelector(selector)?.textContent;
    if (targetContent) return targetContent;
  }
  console.log(
    "target content not found with information selectors: ",
    selectors
  );
  return null;
};

/**
 * Extract article body from webpage
 * @param dom The parsed HTML webpage
 * @param bodySelectors The CSS selector to extract body content
 */
const extractNewsBody = (dom: Document, bodySelectors: string[]) => {
  // extract news piece body with most a (hopefully) valid selector
  let htmlParagraphs: NodeListOf<Element> | null = null;
  for (const selector of bodySelectors) {
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
      "target content not found with body selectors: ",
      bodySelectors
    );
  return paragraphs;
};

/**
 * Parses HTML webpages and extracts relevant information
 * @param sourcePages HTML webpages and URLs for each source. i.e {bbc: {urls: ["www.bbc...", "www.bbc..."], webpages: [bbcHTML, bbcHTML, ...]}, nyt: {urls: ["www.nyt...", "www.nyt..."], webpages: [...]}, ...}
 * @returns News pieces. i.e {bbc: [{url: "www.bbc...", title: "fancy title", date: "silly date"}, {body: ["list", "of", "paragraphs"]}, nyt: [{...}, {...}, ], ...], ... }
 */
export const parseHtml = async (
  sourcePages: SourcePages
): Promise<SourcePieces> => {
  let sourcePieces: SourcePieces = {};
  for (const source in sourcePages) {
    sourcePieces[source] = [];
    const urls = sourcePages[source].urls;
    const htmlPages = sourcePages[source].webpages;

    // get CSS selectors to find the news piece title, date and content
    const [titleSelectors, dateSelectors, contentSelector] = getSelectors(
      source
    );

    htmlPages.forEach((htmlPage, pageIndex) => {
      try {
        const dom = new JSDOM(htmlPage).window.document;

        // extract the news piece url, title, date and content
        const url = urls[pageIndex];
        const title = extractNewsInfo(dom, titleSelectors);
        const date = extractNewsInfo(dom, dateSelectors);
        const paragraphs = extractNewsBody(dom, contentSelector);

        sourcePieces[source].push({ url, title, date, body: paragraphs });
      } catch (error) {
        console.log("Error parsing webpage HTML: ", error);
      }
    });
  }

  return sourcePieces;
};

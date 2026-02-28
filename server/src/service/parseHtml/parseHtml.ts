/** pulls out relevant news article information from the soup of html returned by the website */
import { JSDOM } from "jsdom";
import { getLogger } from "../../logger";
import { SourcePages, NewsPiece } from "../../dataModel/dataModel";
import { getSourceConfig } from "../../config/sources";

const log = getLogger("service/parseHtml");

export interface ParseHtmlMetrics {
  attemptedPages: number;
  parsedPages: number;
  failedPages: number;
}

export interface ParseHtmlResult {
  newsPieces: NewsPiece[];
  metrics: ParseHtmlMetrics;
}

/**
 * Extract information from webpage
 * @param dom The parsed HTML webpage
 * @param selectors The CSS selector to extract information
 * @param source The news source
 */
function extractNewsInfo(
  dom: Document,
  selectors: string[],
  source: string,
): string | null {
  log.debug(`Extracting news information for ${source}`);

  for (const selector of selectors) {
    const targetContent = dom.querySelector(selector)?.textContent;
    if (targetContent) return targetContent.trim();
  }
  log.warn(
    `target content not found for source: ${source}, with information selectors: ${selectors.join(
      ", ",
    )}`,
  );
  return null;
}

/**
 * Extract article body from webpage
 * @param dom The parsed HTML webpage
 * @param contentSelectors The CSS selector to extract body content
 * @param source The news source
 */
function extractNewsBody(
  dom: Document,
  contentSelectors: string[],
  source: string,
): (string | null)[] {
  log.debug(`Extracting news piece body for ${source}`);

  // extract news piece body with most a (hopefully) valid selector
  let htmlParagraphs: NodeListOf<Element> | null = null;
  for (const selector of contentSelectors) {
    const targetContent = dom.querySelectorAll(selector);
    if (targetContent && targetContent.length > 0) {
      htmlParagraphs = targetContent;
      break;
    }
  }

  if (!htmlParagraphs) {
    log.warn(
      `target content not found for source: ${source}, with content selectors: ${contentSelectors.join(
        ", ",
      )}`,
    );
    return [];
  }

  const paragraphs: Array<string | null> = [];
  htmlParagraphs.forEach((element) => {
    const text = element.textContent?.trim();
    if (text) paragraphs.push(text);
  });

  return paragraphs;
}

/**
 * Parses HTML webpages and extracts relevant information
 * @param sourcePages HTML webpages and URLs for each source. i.e {bbc: {urls: ["www.bbc...", "www.bbc..."], webpages: [bbcHTML, bbcHTML, ...]}, nyt: {urls: ["www.nyt...", "www.nyt..."], webpages: [...]}, ...}
 * @returns Array of news pieces. i.e [{source: "bbc", url: "www.bbc...", title: "fancy title", date: "silly date", body: ["list", "of", "paragraphs"]}, {source: "nyt", ...}, ...]
 */
export function parseHtml(sourcePages: SourcePages): NewsPiece[] {
  return parseHtmlWithMetrics(sourcePages).newsPieces;
}

export function parseHtmlWithMetrics(
  sourcePages: SourcePages,
): ParseHtmlResult {
  log.info("Parsing HTML webpage results");

  const metrics: ParseHtmlMetrics = {
    attemptedPages: 0,
    parsedPages: 0,
    failedPages: 0,
  };
  const newsPieces: NewsPiece[] = [];
  for (const source in sourcePages) {
    const urls = sourcePages[source].urls;
    const htmlPages = sourcePages[source].webpages;

    // get CSS selectors from centralized config
    const { selectors } = getSourceConfig(source);

    log.trace(`Retrieved selectors for ${source}`);

    // for each html page extract the relevant news article information and push it into the empty array for that source
    htmlPages.forEach((htmlPage, pageIndex) => {
      metrics.attemptedPages += 1;
      try {
        const dom = new JSDOM(htmlPage).window.document;

        const url = urls[pageIndex];
        const title = extractNewsInfo(dom, selectors.title, source);
        const date = extractNewsInfo(dom, selectors.date, source);
        const paragraphs = extractNewsBody(dom, selectors.content, source);

        newsPieces.push({ url, title, date, body: paragraphs, source });
        metrics.parsedPages += 1;
      } catch (error) {
        metrics.failedPages += 1;
        log.warn({ error }, "Error parsing webpage HTML");
      }
    });
  }

  log.info({ metrics }, "Parse HTML metrics");
  log.info("Finished parsing HTML webpage results");
  return { newsPieces, metrics };
}

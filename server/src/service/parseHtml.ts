import { JSDOM } from "jsdom";
import { SourcePages, SourcePieces } from "../dataModel/dataModel";

const getSelectors = (source: string) => {
  switch (source.toLowerCase()) {
    case "bbc":
      const titleSelector = "#main-heading";
      const dateSelector = "time[data-testid='timestamp'";
      const paragraphSelector = "p";
      return [titleSelector, dateSelector, null, paragraphSelector];
    default:
      return [null, null, null, null];
  }
};

const getData = (selector: string | null, dom: Document) =>
  selector ? dom.querySelector(selector)?.textContent : null;

/**
 * Parses HTML webpages and extracts relevant information
 * @param sourcePages HTML webpages and URLs for each source. i.e {bbc: {urls: ["www.bbc...", "www.bbc..."], webpages: [bbcHTML, bbcHTML, ...]}, nyt: {urls: ["www.nyt...", "www.nyt..."], webpages: [...]}, ...}
 * @returns News pieces
 */
export const parseHtml = async (
  sourcePages: SourcePages
): Promise<SourcePieces> => {
  let sourcePieces: SourcePieces = {};
  for (const source in sourcePages) {
    const urls = sourcePages[source].urls; // [bbcHTML, bbcHTML, ...]
    const htmlPages = sourcePages[source].webPages; // [bbcHTML, bbcHTML, ...]

    // get CSS selectors to find the news piece title, date, author, etc.
    const [
      titleSelector,
      dateSelector,
      authorSelector,
      paragraphSelector,
    ] = getSelectors(source);

    // extract the news piece title, data, author, etc.
    const titles: Array<string | null | undefined> = [];
    const dates: Array<string | null | undefined> = [];
    const authors: Array<string | null | undefined> = [];
    const bodies: Array<Array<string | null | undefined>> = [];
    for (const htmlPage in htmlPages) {
      try {
        const dom = new JSDOM(htmlPage).window.document;

        const title = getData(titleSelector, dom);
        const date = getData(dateSelector, dom);
        const author = getData(authorSelector, dom);
        const paragraphs: Array<string | null> = [];
        paragraphSelector
          ? dom
              .querySelectorAll(paragraphSelector)
              .forEach((element) => paragraphs.push(element.textContent))
          : null;

        titles.push(title);
        dates.push(date);
        authors.push(author);
        bodies.push(paragraphs);
      } catch (error) {
        console.log("Error parsing webpage HTML: ", error);
      }
    }
    sourcePieces[source] = { urls, titles, dates, authors, bodies };
  }

  return sourcePieces;
};

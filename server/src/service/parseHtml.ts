import { JSDOM } from "jsdom";

export interface NewsPiece {
  title: string | null | undefined;
  date: string | null | undefined;
  author: string | null | undefined;
  body: string;
  link: string;
  source: string;
}

const mapRawPages = async (
  source: string,
  links: string[],
  rawPages: string[]
) => {
  console.log(`mapRawPages for ${source}`);

  let parsedNewsPieces: NewsPiece[] = [];
  for (let pageIndex = 0, end = rawPages.length; pageIndex < end; pageIndex++) {
    const htmlPage = rawPages[pageIndex];
    const link = links[pageIndex];

    try {
      const dom = new JSDOM(htmlPage).window.document;

      if (source === "bbc") {
        /** parse BBC article */
        const title = dom.querySelector("#main-heading")?.textContent;
        const date = dom
          .getElementsByTagName("time")?.[0]
          .getAttribute("datetime");
        const author = null; // TODO: get author
        const paragraphs = dom.getElementsByTagName("p");
        let body = "";
        for (
          let paraIdx = 0, end = paragraphs.length;
          paraIdx < end;
          paraIdx++
        ) {
          body += paragraphs[paraIdx].textContent;
        }
        parsedNewsPieces.push({ title, date, author, body, link, source });
      } else if (source === "reuters") {
        /** parses Reuters article */
        const title = dom.querySelector("[class*=ArticleHeader-headline]")
          ?.textContent;
        const date = null; // TODO: no dates
        const author = dom.querySelectorAll("[class*=ArticleBody-byline]")?.[1]
          .textContent;
        const paragraphs = dom
          .querySelectorAll("[class*=ArticleBodyWrapper]")?.[0]
          .getElementsByTagName("p");
        let body = "";
        for (
          let paraIdx = 0, end = paragraphs.length;
          paraIdx < end;
          paraIdx++
        ) {
          body += paragraphs[paraIdx].textContent;
        }
        parsedNewsPieces.push({ title, date, author, body, link, source });
      } else if (source === "nyt") {
        /** parses New York Times article */
        const title = dom.querySelectorAll("[data-test-id=headline]")?.[0]
          .textContent;
        const date = dom
          .getElementsByTagName("time")?.[0]
          .getAttribute("datetime");
        const authorTags = dom.querySelectorAll("[class*=byline-prefix]")?.[0]
          .parentNode?.children;
        let author = "";
        authorTags
          ? (author = Array.from(authorTags)
              .slice(1)
              .map((authorTag) => author + authorTag.textContent)
              .join(", "))
          : null;
        const paragraphs = dom
          .getElementsByName("articleBody")?.[0]
          .getElementsByTagName("p");
        let body = "";
        for (
          let paraIdx = 0, end = paragraphs.length;
          paraIdx < end;
          paraIdx++
        ) {
          body += paragraphs[paraIdx].textContent;
        }
        parsedNewsPieces.push({ title, date, author, body, link, source });
      } else if (source === "ap") {
        /** parses AP article */
        const title = dom
          .querySelector("[Class=CardHeadline]")
          ?.getElementsByTagName("h1")?.[0].textContent;
        const date = dom
          .querySelector("[data-key=timestamp]")
          ?.getAttribute("data-source");
        const author = dom
          .querySelector("[Class=CardHeadline]")
          ?.querySelector("[class*=Component-bylines-]")?.textContent;
        const paragraphs = dom
          .querySelectorAll("[data-key=article]")?.[0]
          .getElementsByTagName("p");
        let body = "";
        for (
          let paraIdx = 0, end = paragraphs.length;
          paraIdx < end;
          paraIdx++
        ) {
          body += paragraphs[paraIdx].textContent;
        }
        parsedNewsPieces.push({ title, date, author, body, link, source });
      } else {
        console.log("source not recognised");
      }
    } catch (error) {
      console.log("mappingService Error:", error);
    }
  }

  console.log(parsedNewsPieces);
  return parsedNewsPieces;
};

export const parseHtml = async (
  sources: string[],
  linksArrays: string[][],
  rawPageArrays: string[][]
): Promise<NewsPiece[]> => {
  let newsPieces: NewsPiece[] = [];
  for (let i = 0, end = sources.length; i < end; i++) {
    // calls map Raw pages with the source, the links, and the corresponding raw pages
    const newsPieceArray = await mapRawPages(
      sources[i],
      linksArrays[i],
      rawPageArrays[i]
    );
    newsPieces = newsPieces.concat(newsPieceArray);
  }
  return newsPieces;
};

/** scrapes news pieces from news sources on the internet */
import axios from "axios";
import { JSDOM } from "jsdom";
import googleSearchIntegration from "../integration/googleSearchIntegration";

interface NewsPiece {
  title: string | null | undefined;
  date: string | null;
  author: string | null;
  body: string | null;
  link: string | null;
  source: string | null;
}

export const scrapeNewsPieceService = async (
  statement: string,
  sources: string[]
) => {
  console.log(
    `scrapeNewsPieceService for sources "${sources}" with statement: "${statement}"`
  );

  // TODO: trial async (https://kapeli.com/cheat_sheets/Axios.docset/Contents/Resources/Documents/index)
  const newsPieces = sources.map(async (source) => {
    const newsPiece: NewsPiece = {
      title: null,
      date: null,
      author: null,
      body: null,
      link: null,
      source: null,
    };

    // search internet for statement
    const query = `${source} + ${statement}`;
    // await googleSearchIntegration(query);
    const links = [
      "https://www.bbc.co.uk/news",
      "https://www.bbc.co.uk/news/world-us-canada-55193939",
      "https://www.bbc.co.uk/news/uk-politics-55191436",
    ];

    links.forEach(async (link) => {
      const htmlPage = await axios.get(link);
      console.log(`axios response: ${htmlPage.data}`);
      const dom = new JSDOM(htmlPage.data).window.document;

      // get title
      newsPiece.title = dom.querySelector("#main-heading")?.textContent;

      // get date
      newsPiece.date = dom
        .getElementsByTagName("time")[0]
        .getAttribute("datetime");

      // get author TODO

      // get body
      const paragraphs = dom.getElementsByTagName("p");
      let body = "";
      for (let paraIdx = 0, end = paragraphs.length; paraIdx < end; paraIdx++) {
        body += paragraphs[paraIdx].textContent;
      }

      // get link
      newsPiece.link = link;

      // get source
      newsPiece.source = source;
      console.log("hello again", newsPiece);
    });

    return newsPiece;
  });
};

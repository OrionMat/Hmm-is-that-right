import path from "path";
import express, { Request, Response } from "express";
import { getNewsPieces } from "./service/getNewsPieces";
import { computeSentenceSimilarities } from "./integration/computeSentenceSimilarities";
import { googleSearch } from "./integration/googleSearch/googleSearch";
import { scrapePageHtml } from "./integration//scrapePageHtml/scrapePageHtml";
import { writeFile } from "fs";

// const sourceUrls = {
//   bbc: ["https://www.bbc.co.uk/news/in-pictures-54118899"],
//   nyt: [
//     "https://www.nytimes.com/column/i-was-misinformed",
//     "https://www.nytimes.com/2018/06/18/nyregion/et-doesnt-like-the-bike-path-either.html",
//   ],
//   reuters: [
//     "https://www.reuters.com/article/us-spain-chess-queens-gambit/spanish-chess-board-sales-soar-after-queens-gambit-cameo-idUSKBN2AG0VJ",
//   ],
// };

// scrapePageHtml(sourceUrls).then((sourceUrls) => console.log(sourceUrls));

scrapePageHtml({
  bbc: ["https://www.bbc.co.uk/news/science-environment-56377567"],
  nyt: [
    "https://www.nytimes.com/2021/03/08/science/math-crumple-fragmentation-andrejevic.html",
    "https://www.nytimes.com/2018/06/18/nyregion/et-doesnt-like-the-bike-path-either.html",
  ],
  reuters: [
    "https://www.reuters.com/article/us-spain-chess-queens-gambit/spanish-chess-board-sales-soar-after-queens-gambit-cameo-idUSKBN2AG0VJ",
  ],
}).then((sourceUrls) =>
  writeFile(
    "C:\\Users\\Orion\\Documents\\GitHub\\Hmm-is-that-right\\server\\src\\service\\parseHtml\\sourcePages.json",
    JSON.stringify(sourceUrls),
    (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    }
  )
);

// googleSearch("covid lockdown lift", ["bbc", "nyt"]);

// const app = express(); // creates express app -> handles creating web servers and parsing http requests
// const port = 3001;

// app.use(express.json()); // adds functionality to parse json request bodies
// app.use("/", express.static(path.join(__dirname, "../../client/build"))); // serves a static resource defined in given directory
// // CORS (Cross-Origin-Resource-Sharing) by default limits what dormains can call the api -> reduce the limitations
// app.use((request: Request, response: Response, inNext) => {
//   response.header("Access-Control-Allow-Origin", "*");
//   response.header("Access-Control-Allow-Methods", "GET,OPTIONS");
//   response.header("Access-Control-Allow-Headers", "Content-Type");
//   inNext();
// });

// app.get("/getNewsPieces", async (request: Request, response: Response) => {
//   console.log(`received request with body: ${JSON.stringify(request.query)}`);
//   const statement = request.query.statement;
//   const sources = request.query.sources;
//   if (!statement || !sources) {
//     response.send("error receiving data");
//   }

//   try {
//     const newsPieces = await getNewsService(
//       statement as string,
//       sources as string[]
//     );
//     response.json(newsPieces);
//   } catch (error) {
//     response.send("error");
//   }
// });

// app.listen(port, () => {
//   console.log(`app listening at http://localhost:${port}`);
// });

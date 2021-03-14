import path from "path";
import express, { Request, Response } from "express";
import { getNewsPieces } from "./service/getNewsPieces";

const app = express(); // creates express app -> handles creating web servers and parsing http requests
const port = 3001;

app.use(express.json()); // adds functionality to parse json request bodies
app.use("/", express.static(path.join(__dirname, "../../client/build"))); // serves a static resource defined in given directory
// CORS (Cross-Origin-Resource-Sharing) by default limits what dormains can call the api -> reduce the limitations
app.use((request: Request, response: Response, inNext) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  response.header("Access-Control-Allow-Headers", "Content-Type");
  inNext();
});

app.get("/getNewsPieces", async (request: Request, response: Response) => {
  console.log(`received request with body: ${JSON.stringify(request.query)}`);
  const statement = request.query.statement;
  const sources = request.query.sources;
  if (!statement || !sources) {
    response.send("error receiving data");
  }

  try {
    const newsPieces = await getNewsPieces(
      statement as string,
      sources as string[]
    );
    response.json(newsPieces);
  } catch (error) {
    response.send("error");
  }
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

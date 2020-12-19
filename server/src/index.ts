import path from "path";
import express, { Request, Response } from "express";
import { getNewsService } from "./service/getNewsService";

const app = express(); // creates express app -> handles creating web servers and parsing http requests
const port = 3000;

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
  console.log(`received request with body: ${request.body}`);
  try {
    const newsPieces = await getNewsService(request.body);
    response.json(newsPieces);
  } catch (error) {
    response.send("error");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

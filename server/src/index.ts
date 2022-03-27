import path from "path";
import express, { Request, Response } from "express";
import { getNewsPieces } from "./service/getNewsPieces";
import { StatusCodes } from "http-status-codes";
import expressPinoLogger from "express-pino-logger";
import { getLogger } from "./logger";

const log = getLogger("index");

const app = express(); // creates express app. Handles creating web servers and parsing http requests
const port = 3001; // local port to run server on

app.use(express.json()); // adds functionality to parse json request bodies
app.use("/", express.static(path.join(__dirname, "../../client/build"))); // serves a static resource defined in given directory
// adds logging middleware for using the Pino logging library with the express
app.use(
  expressPinoLogger({
    logger: log,
    autoLogging: true,
  })
);

// CORS (Cross-Origin-Resource-Sharing) by default limits what domains can call the api. This reduces the limitations
app.use((_: Request, response: Response, inNext) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  response.header("Access-Control-Allow-Headers", "Content-Type");
  inNext();
});

// endpoint for getting news pieces
app.get("/getNewsPieces", async (request: Request, response: Response) => {
  log.info(`received request with body: ${JSON.stringify(request.query)}`);

  const statement = request.query.statement as string;
  const sources = request.query.sources as string[];
  if (!statement || !sources) {
    log.error(
      `Bad request. No statement or no sources received. Request: ${JSON.stringify(
        request.query
      )}`
    );
    response
      .status(StatusCodes.BAD_REQUEST)
      .send("Bad request. No statement or no sources received.");
  }

  try {
    const newsPieces = await getNewsPieces(statement, sources);
    response.json(newsPieces);
  } catch (error) {
    log.error("Internal server error: ", error);
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Internal server error.");
  }
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

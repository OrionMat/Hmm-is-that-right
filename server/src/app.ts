import path from "path";
import cors from "cors";
import express from "express";
import expressPinoLogger from "express-pino-logger";
import { errorHandler } from "./middleware/errorHandler";
import { getNewsPiecesRoute } from "./routes/getNewsPieces.route";
import { quizRoute } from "./routes/quiz.route";
import { requestContext } from "./middleware/requestContext";

export const app = express();

app.use(express.json());
app.use(cors());
app.use("/", express.static(path.join(__dirname, "../../client/build")));
app.use(requestContext);
app.use(expressPinoLogger());

app.use("/getNewsPieces", getNewsPiecesRoute);
app.use("/api/quiz", quizRoute);
app.use(errorHandler);

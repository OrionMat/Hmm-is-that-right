import path from "path";
import cors from "cors";
import express from "express";
import expressPinoLogger from "express-pino-logger";
import { errorHandler } from "./middleware/errorHandler";
import { getNewsPiecesRoute } from "./routes/getNewsPieces.route";
import { getHeadlineNewsRoute } from "./routes/getHeadlineNews.route";
import { quizRoute } from "./routes/quiz.route";
import { morningBriefRoute } from "./routes/morningBrief.route";
import { submitFeedbackRoute } from "./routes/submitFeedback.route";
import { paperOfYearRoute } from "./routes/paperOfYear.route";
import { requestContext } from "./middleware/requestContext";

export const app = express();

app.use(express.json());
app.use(cors());
app.use("/", express.static(path.join(__dirname, "../../client/build")));
app.use(requestContext);
app.use(expressPinoLogger());

app.use("/getNewsPieces", getNewsPiecesRoute);
app.use("/getHeadlineNews", getHeadlineNewsRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/morning-brief", morningBriefRoute);
app.use("/api/morning-brief", submitFeedbackRoute);
app.use("/api/paper-of-year", paperOfYearRoute);
app.use(errorHandler);

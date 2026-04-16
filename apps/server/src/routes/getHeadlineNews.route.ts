import { Router } from "express";
import { getHeadlineNewsController } from "../controllers/getHeadlineNews.controller";
import { validateRequest } from "../middleware/validateRequest";
import { getHeadlineNewsQuerySchema } from "../schemas/getHeadlineNews.schema";

export const getHeadlineNewsRoute = Router();

getHeadlineNewsRoute.get(
  "/",
  validateRequest({ query: getHeadlineNewsQuerySchema }),
  getHeadlineNewsController
);

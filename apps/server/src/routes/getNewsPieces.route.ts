import { Router } from "express";
import { getNewsPiecesController } from "../controllers/getNewsPieces.controller";
import { validateRequest } from "../middleware/validateRequest";
import { getNewsPiecesQuerySchema } from "../schemas/getNewsPieces.schema";

export const getNewsPiecesRoute = Router();

getNewsPiecesRoute.get(
  "/",
  validateRequest({ query: getNewsPiecesQuerySchema }),
  getNewsPiecesController
);

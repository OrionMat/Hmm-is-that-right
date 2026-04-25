import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { morningBriefQuerySchema } from "../schemas/morningBrief.schema";
import { morningBriefController } from "../controllers/morningBrief.controller";

export const morningBriefRoute = Router();

morningBriefRoute.get(
  "/stream",
  validateRequest({ query: morningBriefQuerySchema }),
  morningBriefController,
);

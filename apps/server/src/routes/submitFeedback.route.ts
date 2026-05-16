import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { submitFeedbackBodySchema } from "../schemas/submitFeedback.schema";
import { submitFeedbackController } from "../controllers/submitFeedback.controller";

export const submitFeedbackRoute = Router();

submitFeedbackRoute.post(
  "/feedback",
  validateRequest({ body: submitFeedbackBodySchema }),
  submitFeedbackController,
);

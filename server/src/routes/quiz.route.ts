import { Router } from "express";
import { 
  generateQuizController, 
  submitQuizController
} from "../controllers/quiz.controller";
import { validateRequest } from "../middleware/validateRequest";
import { quizRequestSchema, quizSubmissionSchema } from "../schemas/quiz.schema";

export const quizRoute = Router();

quizRoute.post(
  "/questions",
  validateRequest({ body: quizRequestSchema }),
  generateQuizController
);

quizRoute.post(
  "/results",
  validateRequest({ body: quizSubmissionSchema }),
  submitQuizController
);

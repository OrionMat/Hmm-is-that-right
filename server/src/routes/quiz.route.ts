import { Router } from "express";
import { 
  generateQuizController, 
  testQuizConnectionController 
} from "../controllers/quiz.controller";
import { validateRequest } from "../middleware/validateRequest";
import { quizRequestSchema } from "../schemas/quiz.schema";

export const quizRoute = Router();

quizRoute.post(
  "/questions",
  validateRequest({ body: quizRequestSchema }),
  generateQuizController
);

quizRoute.get("/test", testQuizConnectionController);

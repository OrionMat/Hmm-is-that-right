import { z } from "zod";

export const quizRequestSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required"),
  questionCount: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  category: z.string().optional(),
});

export type QuizRequest = z.infer<typeof quizRequestSchema>;

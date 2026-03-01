import { z } from "zod";

export const quizRequestSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(100),
  questionCount: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  category: z.string().optional(),
});

export const quizSubmissionSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      label: z.string(),
    })),
    correctAnswer: z.string(),
    explanation: z.string(),
  })),
  answers: z.record(z.string(), z.string()), // questionId -> selectedOptionId
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export type QuizRequest = z.infer<typeof quizRequestSchema>;
export type QuizSubmission = z.infer<typeof quizSubmissionSchema>;

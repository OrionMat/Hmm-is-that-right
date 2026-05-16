import { z } from "zod";

const conversationTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const paperOfYearQaBodySchema = z.object({
  arxivId: z.string().min(1, "arxivId is required"),
  question: z.string().min(1, "question is required").max(2000, "question too long"),
  history: z.array(conversationTurnSchema).max(50, "history too long"),
});

export type PaperOfYearQaBody = z.infer<typeof paperOfYearQaBodySchema>;

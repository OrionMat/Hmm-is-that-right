import { z } from "zod";

export const submitFeedbackBodySchema = z.object({
  text: z.string().trim().min(1, "feedback text is required").max(5000),
});

export type SubmitFeedbackBody = z.infer<typeof submitFeedbackBodySchema>;

import { z } from "zod";

export const morningBriefQuerySchema = z.object({
  /** Override the date for mode rotation testing, format: YYYY-MM-DD */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")
    .optional(),
  /** Pass ?nocache=1 to bypass the in-memory cache */
  nocache: z.enum(["1"]).optional(),
});

export type MorningBriefQuery = z.infer<typeof morningBriefQuerySchema>;

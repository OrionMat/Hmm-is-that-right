import { z } from "zod";

export const getNewsPiecesQuerySchema = z.object({
  statement: z.string().trim().min(1, "statement is required"),
  sources: z
    .union([z.string(), z.array(z.string())])
    .transform((sources) => (Array.isArray(sources) ? sources : [sources]))
    .pipe(
      z.array(z.string().trim().min(1)).min(1, "at least one source is required")
    ),
});

export type GetNewsPiecesQuery = z.infer<typeof getNewsPiecesQuerySchema>;

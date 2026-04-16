import { z } from "zod";

const VALID_SOURCES = ["bbc", "nyt", "ap", "deeplearning"] as const;
const VALID_MODELS = ["gemini-2.0-flash-lite", "gemini-2.5-flash", "gpt-4o-mini"] as const;

export const getHeadlineNewsQuerySchema = z.object({
  sources: z
    .union([z.string(), z.array(z.string())])
    .transform((sources) => (Array.isArray(sources) ? sources : [sources]))
    .pipe(
      z
        .array(z.enum(VALID_SOURCES))
        .min(1, "at least one source is required")
    ),
  model: z.enum(VALID_MODELS).default("gemini-2.0-flash-lite"),
});

export type GetHeadlineNewsQuery = z.infer<typeof getHeadlineNewsQuerySchema>;

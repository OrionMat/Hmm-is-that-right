import { z } from "zod";

export const SUPPORTED_TOGGLE_SOURCES = ["bbc", "nyt", "ap"] as const;

export const morningBriefQuerySchema = z.object({
  /** Override the date for mode rotation testing, format: YYYY-MM-DD */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")
    .optional(),
  /** Pass ?nocache=1 to bypass the in-memory cache */
  nocache: z.enum(["1"]).optional(),
  /** Optional free-form search query. When present, the three default sections
   *  are replaced with a single SerpAPI-driven search section. */
  query: z.string().trim().min(1).max(200).optional(),
  /** Which toggle-able news sources are enabled. Used to filter both the
   *  default world section and the search section. Default: all. */
  sources: z
    .union([z.enum(SUPPORTED_TOGGLE_SOURCES), z.array(z.enum(SUPPORTED_TOGGLE_SOURCES))])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional(),
});

export type MorningBriefQuery = z.infer<typeof morningBriefQuerySchema>;
export type ToggleSource = (typeof SUPPORTED_TOGGLE_SOURCES)[number];
export const TOGGLE_SOURCES = SUPPORTED_TOGGLE_SOURCES;

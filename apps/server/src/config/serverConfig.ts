import dotenv from "dotenv";

dotenv.config();

export type LoggingLevel =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

export interface ServerConfig {
  serpSearchApiKey: string | undefined;
  geminiApiKey: string | undefined;
  openAiApiKey: string | undefined;
  anthropicApiKey: string | undefined;
  redditUserAgent: string;
  morningBriefCacheTtlMs: number;
  loggingLevel: LoggingLevel;
}

export const serverConfig: ServerConfig = {
  serpSearchApiKey: process.env.SERP_SEARCH_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openAiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  redditUserAgent: process.env.REDDIT_USER_AGENT ?? "web:hmm-is-that-right:1.0 (by /u/anonymous)",
  morningBriefCacheTtlMs: Number(process.env.MORNING_BRIEF_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000),
  loggingLevel: (process.env.LOG_LEVEL as LoggingLevel) || "info",
};

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
  loggingLevel: LoggingLevel;
  googleCacheTtlMs: number;
  pageCacheTtlMs: number;
}

export const serverConfig: ServerConfig = {
  serpSearchApiKey: process.env.SERP_SEARCH_API_KEY,
  loggingLevel: (process.env.LOG_LEVEL as LoggingLevel) || "info",
  googleCacheTtlMs: Number(process.env.GOOGLE_CACHE_TTL_MS) || 60 * 60 * 1000, // default: 1 hour
  pageCacheTtlMs: Number(process.env.PAGE_CACHE_TTL_MS) || 6 * 60 * 60 * 1000, // default: 6 hours
};

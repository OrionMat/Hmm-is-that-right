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
}

export const serverConfig: ServerConfig = {
  serpSearchApiKey: process.env.SERP_SEARCH_API_KEY,
  loggingLevel: (process.env.LOG_LEVEL as LoggingLevel) || "info",
};

import pino from "pino";

/**
 * Gets logger.
 * @param fileName Name of the file printing the log.
 * @returns Pino logger
 */
export function getLogger(fileName: string) {
  return pino({
    name: fileName,
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: true,
        ignore: "pid,hostname",
      },
    },
  });
}

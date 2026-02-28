/**
 * Gets mock logger.
 * @param fileName Name of the file printing the log.
 * @returns Pino logger
 */
interface MockLogger {
  trace: (..._args: unknown[]) => void;
  debug: (..._args: unknown[]) => void;
  info: (..._args: unknown[]) => void;
  warn: (..._args: unknown[]) => void;
  error: (..._args: unknown[]) => void;
  fatal: (..._args: unknown[]) => void;
}

const noop = (..._args: unknown[]) => {};

export function getLogger(_fileName: string): MockLogger {
  return {
    trace: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    fatal: noop,
  };
}

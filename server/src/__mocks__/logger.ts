/**
 * Gets mock logger.
 * @param fileName Name of the file printing the log.
 * @returns Pino logger
 */
// TODO: add return type to this function (it's type is logging level: function)
export function getLogger(fileName: string) {
  console.log("HERE!!");
  return {
    trace: (message: string) => console.log(`${fileName}: ${message}`),
    debug: (message: string) => console.log(`${fileName}: ${message}`),
    info: (message: string) => console.log(`${fileName}: ${message}`),
    warn: (message: string) => console.log(`${fileName}: ${message}`),
    error: (message: string) => console.log(`${fileName}: ${message}`),
    fatal: (message: string) => console.log(`${fileName}: ${message}`),
  };
}

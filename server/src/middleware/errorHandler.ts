import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getLogger } from "../logger";

const log = getLogger("middleware/errorHandler");

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  if (error instanceof Error) {
    log.error(
      { message: error.message, stack: error.stack },
      "Unhandled server error"
    );
  } else {
    log.error({ error }, "Unhandled server error");
  }
  response
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send("Internal server error.");
}

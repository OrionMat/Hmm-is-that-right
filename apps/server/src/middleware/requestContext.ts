import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Attaches a unique request ID to each request.
 * Can be provided via X-Request-Id or X-Trace-Id headers, or generated.
 */
export function requestContext(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const requestId =
    request.header("X-Request-Id") ||
    request.header("X-Trace-Id") ||
    uuidv4();

  // Attach to request object for use in controllers/services
  request.id = requestId;
  
  // Also attach to response headers so client knows the ID
  response.setHeader("X-Request-Id", requestId);

  next();
}

import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodType, z } from "zod";

type ValidationSchemas = {
  query?: ZodType;
  body?: ZodType;
  params?: ZodType;
};

type ValidationError = {
  scope: "query" | "body" | "params";
  path: string;
  message: string;
};

function mapIssues(scope: ValidationError["scope"], issues: z.ZodIssue[]) {
  return issues.map<ValidationError>(({ path, message }) => ({
    scope,
    path: path.join("."),
    message,
  }));
}

/**
 * Validates the incoming request against the provided Zod schemas.
 * Attaches validated data to request.validated
 */
export function validateRequest({
  query,
  body,
  params,
}: ValidationSchemas): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    
    // Initialize validated property if not present
    request.validated = request.validated || {};

    if (query) {
      const queryResult = query.safeParse(request.query);
      if (queryResult.success) {
        request.validated.query = queryResult.data;
      } else {
        errors.push(...mapIssues("query", queryResult.error.issues));
      }
    }

    if (body) {
      const bodyResult = body.safeParse(request.body);
      if (bodyResult.success) {
        request.validated.body = bodyResult.data;
      } else {
        errors.push(...mapIssues("body", bodyResult.error.issues));
      }
    }

    if (params) {
      const paramsResult = params.safeParse(request.params);
      if (paramsResult.success) {
        request.validated.params = paramsResult.data;
      } else {
        errors.push(...mapIssues("params", paramsResult.error.issues));
      }
    }

    if (errors.length > 0) {
      return response.status(400).json({
        message: "Invalid request data",
        errors,
      });
    }

    next();
  };
}

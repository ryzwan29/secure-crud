import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Validates and coerces req.body / req.params / req.query against a Zod
 * schema. Replaces each part with the parsed (sanitized) value so
 * downstream code only ever sees trusted, well-typed input.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      next(ApiError.badRequest("Validation failed", fieldErrors));
      return;
    }

    const parsed = result.data as {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query as never;
    if (parsed.params !== undefined) req.params = parsed.params as never;
    next();
  };
}

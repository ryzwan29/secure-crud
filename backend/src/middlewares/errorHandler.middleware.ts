import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { isProd } from "../config/env";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} tidak ditemukan` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logger.error(err.message, { path: req.path, details: err.details });
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Unexpected error: log full detail server-side, never leak internals to client.
  logger.error("Unhandled error", {
    path: req.path,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error && !isProd ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
}

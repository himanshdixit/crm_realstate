import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/ApiError.js";

function normalizeError(error) {
  if (error instanceof ApiError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map(({ path, message }) => ({ field: path, message }));
    return new ApiError(422, "Database validation failed", "VALIDATION_ERROR", errors);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new ApiError(400, `Invalid value for ${error.path}`, "INVALID_IDENTIFIER");
  }

  if (error?.code === 11000) {
    const fields = Object.keys(error.keyPattern ?? error.keyValue ?? {});
    return new ApiError(409, "A record with that value already exists", "DUPLICATE_RESOURCE", fields.map((field) => ({ field, message: "Must be unique" })));
  }

  return new ApiError(500, "An unexpected error occurred", "INTERNAL_SERVER_ERROR", null, { cause: error });
}

export function errorHandler(error, request, response, _next) {
  const normalized = normalizeError(error);

  logger.log(normalized.statusCode >= 500 ? "error" : "warn", normalized.message, {
    requestId: request.id,
    method: request.method,
    path: request.originalUrl,
    statusCode: normalized.statusCode,
    code: normalized.code,
    stack: normalized.statusCode >= 500 ? error.stack : undefined,
  });

  response.status(normalized.statusCode).json({
    success: false,
    message: normalized.message,
    data: null,
    errors: normalized.errors,
    code: normalized.code,
    requestId: request.id,
    ...(env.NODE_ENV === "development" && normalized.statusCode >= 500 ? { stack: error.stack } : {}),
  });
}

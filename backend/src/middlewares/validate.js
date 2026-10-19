import { matchedData, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export function validate(request, _response, next) {
  const result = validationResult(request);
  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true }).map((error) => ({
      field: error.path,
      location: error.location,
      message: error.msg,
    }));
    next(new ApiError(422, "Request validation failed", "VALIDATION_ERROR", errors));
    return;
  }

  request.validated = matchedData(request, { includeOptionals: true });
  next();
}

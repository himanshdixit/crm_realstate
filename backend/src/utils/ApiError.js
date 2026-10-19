export class ApiError extends Error {
  constructor(statusCode, message, code = "API_ERROR", errors = null, options = {}) {
    super(message, options);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace?.(this, ApiError);
  }
}

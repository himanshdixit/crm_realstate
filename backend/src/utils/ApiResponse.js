export function successResponse({ message = "Request completed successfully", data = null, meta } = {}) {
  return {
    success: true,
    message,
    data,
    errors: null,
    ...(meta ? { meta } : {}),
  };
}

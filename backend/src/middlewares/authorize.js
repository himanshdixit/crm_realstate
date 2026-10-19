import { ApiError } from "../utils/ApiError.js";

export function authorize(...requiredPermissions) {
  return (request, _response, next) => {
    if (!request.auth) {
      next(new ApiError(401, "Authentication is required", "AUTHENTICATION_REQUIRED"));
      return;
    }

    const granted = new Set(request.auth.permissions);
    const missing = requiredPermissions.filter((permission) => !granted.has(permission));
    if (missing.length > 0) {
      next(new ApiError(403, "You do not have permission to perform this action", "PERMISSION_DENIED", missing.map((permission) => ({ permission, message: "Permission is required" }))));
      return;
    }
    next();
  };
}

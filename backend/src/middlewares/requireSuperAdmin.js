import { ApiError } from "../utils/ApiError.js";

export function requireSuperAdmin(request, _response, next) {
  const allowed = request.auth?.user?.roles?.some((role) => role.slug === "super-admin");
  if (!allowed) {
    next(new ApiError(403, "Super Admin access is required", "SUPER_ADMIN_REQUIRED"));
    return;
  }
  next();
}

import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ACCESS_COOKIE } from "../utils/cookies.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { resolvePermissionKeys } from "../helpers/permissionResolver.js";

function extractToken(request) {
  const authorization = request.get("Authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim();
  return request.cookies?.[ACCESS_COOKIE] ?? null;
}

export async function authenticate(request, _response, next) {
  try {
    const token = extractToken(request);
    if (!token) throw new ApiError(401, "Authentication is required", "AUTHENTICATION_REQUIRED");

    const payload = verifyAccessToken(token);
    const user = await User.findOne({ _id: payload.sub, status: "active", deletedAt: null })
      .populate({ path: "roles", match: { isActive: true, deletedAt: null }, populate: { path: "permissions", match: { isActive: true } } })
      .populate({ path: "directPermissions", match: { isActive: true } })
      .populate({ path: "deniedPermissions", match: { isActive: true } });

    if (!user) throw new ApiError(401, "User session is no longer active", "SESSION_INACTIVE");
    if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime() - 1000) {
      throw new ApiError(401, "Password changed after this token was issued", "TOKEN_REVOKED");
    }

    request.auth = { user, userId: user.id, sessionId: payload.sid, permissions: resolvePermissionKeys(user) };
    next();
  } catch (error) {
    next(error);
  }
}

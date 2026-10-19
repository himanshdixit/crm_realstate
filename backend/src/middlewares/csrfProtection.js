import { CSRF_COOKIE } from "../utils/cookies.js";
import { timingSafeEqual } from "../utils/hashing.js";
import { ApiError } from "../utils/ApiError.js";

export function csrfProtection(request, _response, next) {
  const cookieToken = request.cookies?.[CSRF_COOKIE];
  const headerToken = request.get("x-csrf-token");
  if (!cookieToken || !headerToken || !timingSafeEqual(cookieToken, headerToken)) {
    next(new ApiError(403, "CSRF token is missing or invalid", "CSRF_TOKEN_INVALID"));
    return;
  }
  next();
}

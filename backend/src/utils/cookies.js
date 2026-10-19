import { env } from "../config/env.js";

export const ACCESS_COOKIE = "crm_access";
export const REFRESH_COOKIE = "crm_refresh";
export const CSRF_COOKIE = "crm_csrf";

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function accessCookieOptions() {
  return { ...baseCookieOptions(), maxAge: 15 * 60 * 1000 };
}

export function refreshCookieOptions(days) {
  return { ...baseCookieOptions(), path: "/api/v1/auth", maxAge: days * 24 * 60 * 60 * 1000 };
}

export function csrfCookieOptions(days = 1) {
  return { ...baseCookieOptions(), httpOnly: false, maxAge: days * 24 * 60 * 60 * 1000 };
}

export function clearAuthenticationCookies(response) {
  response.clearCookie(ACCESS_COOKIE, accessCookieOptions());
  response.clearCookie(REFRESH_COOKIE, { ...baseCookieOptions(), path: "/api/v1/auth" });
  response.clearCookie(CSRF_COOKIE, { ...baseCookieOptions(), httpOnly: false });
}

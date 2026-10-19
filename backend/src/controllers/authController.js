import { authService } from "../services/authService.js";
import { successResponse } from "../utils/ApiResponse.js";
import { ACCESS_COOKIE, CSRF_COOKIE, REFRESH_COOKIE, accessCookieOptions, clearAuthenticationCookies, csrfCookieOptions, refreshCookieOptions } from "../utils/cookies.js";
import { ApiError } from "../utils/ApiError.js";
import { signAccessToken } from "../utils/jwt.js";

function setAuthenticationCookies(response, tokens) {
  response.cookie(ACCESS_COOKIE, tokens.accessToken, accessCookieOptions());
  response.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions(tokens.days));
  response.cookie(CSRF_COOKIE, tokens.csrfToken, csrfCookieOptions(tokens.days));
}

export async function register(request, response) {
  const data = await authService.register(request.validated, request);
  response.status(201).json(successResponse({ message: "Registration successful. Check your email to activate the account.", data }));
}

export async function verifyEmail(request, response) {
  const data = await authService.verifyEmail(request.validated.token, request);
  response.json(successResponse({ message: "Email verified successfully. You can now sign in.", data }));
}

export async function resendVerification(request, response) {
  await authService.resendVerification(request.validated.email);
  response.json(successResponse({ message: "If the account is awaiting verification, a new email has been sent." }));
}

export async function login(request, response) {
  const result = await authService.login(request.validated, request);
  setAuthenticationCookies(response, result.tokens);
  response.json(successResponse({ message: "Signed in successfully", data: { user: result.user, permissions: result.permissions, csrfToken: result.tokens.csrfToken } }));
}

export async function refresh(request, response) {
  const rawToken = request.cookies?.[REFRESH_COOKIE];
  if (!rawToken) throw new ApiError(401, "Refresh session is required", "REFRESH_TOKEN_REQUIRED");
  const result = await authService.refresh(rawToken, request);
  setAuthenticationCookies(response, result.tokens);
  response.json(successResponse({ message: "Session refreshed", data: { user: result.user, permissions: result.permissions, csrfToken: result.tokens.csrfToken } }));
}

export async function logout(request, response) {
  await authService.revokeSession(request.auth.userId, request.auth.sessionId);
  clearAuthenticationCookies(response);
  response.json(successResponse({ message: "Signed out successfully" }));
}

export async function logoutAll(request, response) {
  await authService.revokeAllSessions(request.auth.userId);
  clearAuthenticationCookies(response);
  response.json(successResponse({ message: "All sessions have been signed out" }));
}

export async function forgotPassword(request, response) {
  await authService.forgotPassword(request.validated.email);
  response.json(successResponse({ message: "If the account exists, password-reset instructions have been sent." }));
}

export async function resetPassword(request, response) {
  await authService.resetPassword(request.validated.token, request.validated.password, request);
  clearAuthenticationCookies(response);
  response.json(successResponse({ message: "Password reset successfully. Sign in with your new password." }));
}

export async function changePassword(request, response) {
  await authService.changePassword(request.auth.userId, request.validated.currentPassword, request.validated.newPassword, request.auth.sessionId, request);
  response.cookie(ACCESS_COOKIE, signAccessToken({ userId: request.auth.userId, sessionId: request.auth.sessionId }), accessCookieOptions());
  response.json(successResponse({ message: "Password changed. Other sessions have been signed out." }));
}

export async function me(request, response) {
  const data = await authService.me(request.auth.userId);
  response.json(successResponse({ data }));
}

export async function updateProfile(request, response) {
  const user = await authService.updateProfile(request.auth.userId, request.validated, request);
  response.json(successResponse({ message: "Profile updated", data: { user } }));
}

export async function sessions(request, response) {
  const data = await authService.sessions(request.auth.userId, request.auth.sessionId);
  response.json(successResponse({ data }));
}

export async function deleteSession(request, response) {
  await authService.revokeSession(request.auth.userId, request.validated.sessionId, "user-revoked");
  if (request.validated.sessionId === request.auth.sessionId) clearAuthenticationCookies(response);
  response.json(successResponse({ message: "Session revoked" }));
}

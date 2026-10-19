import crypto from "node:crypto";
import { env } from "../config/env.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { ApiError } from "../utils/ApiError.js";
import { hashToken } from "../utils/hashing.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

function expiry(days) { return new Date(Date.now() + days * 86400000); }

export async function createSession({ userId, rememberMe, request, familyId = crypto.randomUUID() }) {
  const days = rememberMe ? env.REMEMBER_ME_TTL_DAYS : env.REFRESH_TOKEN_TTL_DAYS;
  const tokenId = crypto.randomUUID();
  const refreshToken = signRefreshToken({ userId, tokenId, familyId, expiresIn: `${days}d` });
  await RefreshToken.create({ user: userId, tokenHash: hashToken(refreshToken), tokenId, familyId, expiresAt: expiry(days), ipAddress: request.ip, userAgent: request.get("user-agent"), deviceFingerprint: request.get("x-device-fingerprint") || null });
  return { accessToken: signAccessToken({ userId, sessionId: tokenId }), refreshToken, csrfToken: crypto.randomBytes(32).toString("hex"), days, sessionId: tokenId };
}

export async function rotateSession(rawToken, request) {
  const payload = verifyRefreshToken(rawToken);
  const stored = await RefreshToken.findOne({ tokenId: payload.jti }).select("+tokenHash");
  if (!stored || stored.tokenHash !== hashToken(rawToken)) throw new ApiError(401, "Refresh session is invalid", "INVALID_REFRESH_TOKEN");
  if (stored.revokedAt) {
    await RefreshToken.updateMany({ familyId: stored.familyId, revokedAt: null }, { $set: { revokedAt: new Date(), revokeReason: "token-reuse-detected" } });
    throw new ApiError(401, "Session reuse was detected; all related sessions were revoked", "TOKEN_REUSE_DETECTED");
  }
  const replacementId = crypto.randomUUID();
  const claimed = await RefreshToken.findOneAndUpdate({ _id: stored._id, revokedAt: null }, { $set: { revokedAt: new Date(), revokeReason: "rotated", replacedByTokenId: replacementId, lastUsedAt: new Date() } }, { new: true });
  if (!claimed) throw new ApiError(401, "Refresh token was already used", "TOKEN_REUSE_DETECTED");
  const remainingDays = Math.max(1, Math.ceil((stored.expiresAt.getTime() - Date.now()) / 86400000));
  const refreshToken = signRefreshToken({ userId: stored.user, tokenId: replacementId, familyId: stored.familyId, expiresIn: `${remainingDays}d` });
  await RefreshToken.create({ user: stored.user, tokenHash: hashToken(refreshToken), tokenId: replacementId, familyId: stored.familyId, expiresAt: stored.expiresAt, ipAddress: request.ip, userAgent: request.get("user-agent"), deviceFingerprint: request.get("x-device-fingerprint") || stored.deviceFingerprint });
  return { userId: stored.user, accessToken: signAccessToken({ userId: stored.user, sessionId: replacementId }), refreshToken, csrfToken: crypto.randomBytes(32).toString("hex"), days: remainingDays };
}

export function revokeSession(tokenId, reason = "logout") { return RefreshToken.updateOne({ tokenId, revokedAt: null }, { $set: { revokedAt: new Date(), revokeReason: reason } }); }
export function revokeAllSessions(userId, reason = "logout-all") { return RefreshToken.updateMany({ user: userId, revokedAt: null }, { $set: { revokedAt: new Date(), revokeReason: reason } }); }

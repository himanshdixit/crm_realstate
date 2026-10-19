import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

const ISSUER = "estateflow-api";
const AUDIENCE = "estateflow-web";

export function signAccessToken({ userId, sessionId }) {
  return jwt.sign(
    { sub: String(userId), sid: sessionId, type: "access" },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_TTL, issuer: ISSUER, audience: AUDIENCE, jwtid: crypto.randomUUID() },
  );
}

export function signRefreshToken({ userId, tokenId, familyId, expiresIn }) {
  return jwt.sign(
    { sub: String(userId), family: familyId, type: "refresh" },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn, issuer: ISSUER, audience: AUDIENCE, jwtid: tokenId },
  );
}

function verify(token, secret, expectedType) {
  try {
    const payload = jwt.verify(token, secret, { issuer: ISSUER, audience: AUDIENCE });
    if (payload.type !== expectedType) throw new Error("Incorrect token type");
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Authentication token has expired", "TOKEN_EXPIRED");
    }
    throw new ApiError(401, "Authentication token is invalid or expired", "INVALID_TOKEN");
  }
}

export const verifyAccessToken = (token) => verify(token, env.ACCESS_TOKEN_SECRET, "access");
export const verifyRefreshToken = (token) => verify(token, env.REFRESH_TOKEN_SECRET, "refresh");

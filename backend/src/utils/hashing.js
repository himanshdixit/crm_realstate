import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export function hashPassword(password) {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

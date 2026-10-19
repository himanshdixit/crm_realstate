import crypto from "node:crypto";
import { env } from "../config/env.js";
import { SYSTEM_ROLES } from "../constants/roles.js";
import { EmailVerificationToken } from "../models/EmailVerificationToken.js";
import { LoginHistory } from "../models/LoginHistory.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import { resolvePermissionKeys } from "../helpers/permissionResolver.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword, hashToken, verifyPassword } from "../utils/hashing.js";
import { auditService } from "./auditService.js";
import { emailService } from "./emailService.js";
import { createSession, revokeAllSessions, rotateSession } from "./tokenService.js";
import { notificationEventService } from "./notificationEventService.js";

const userPopulation = [
  { path: "roles", match: { isActive: true, deletedAt: null }, populate: { path: "permissions", match: { isActive: true } } },
  { path: "directPermissions", match: { isActive: true } },
  { path: "deniedPermissions", match: { isActive: true } },
];

function rawToken() { return crypto.randomBytes(48).toString("base64url"); }
function tokenExpiry(minutes) { return new Date(Date.now() + minutes * 60000); }

async function hydratedUser(userId) {
  let query = User.findById(userId);
  for (const population of userPopulation) query = query.populate(population);
  return query;
}

function publicSession(user) {
  return { user: user.toJSON(), permissions: resolvePermissionKeys(user) };
}

async function sendVerification(user) {
  const token = rawToken();
  await EmailVerificationToken.deleteMany({ user: user._id });
  await EmailVerificationToken.create({ user: user._id, tokenHash: hashToken(token), expiresAt: tokenExpiry(env.EMAIL_VERIFICATION_TTL_MINUTES) });
  await emailService.sendVerification(user, token);
}

export const authService = {
  async register(input, request) {
    const email = input.email.toLowerCase();
    if (await User.exists({ email })) throw new ApiError(409, "An account with this email already exists", "EMAIL_ALREADY_REGISTERED");
    const customerRole = await Role.findOne({ slug: SYSTEM_ROLES.CUSTOMER, organization: null, isActive: true, deletedAt: null });
    if (!customerRole) throw new ApiError(503, "Identity reference data is not initialized", "AUTH_SETUP_REQUIRED");
    const user = await User.create({ firstName: input.firstName, lastName: input.lastName, email, phone: input.phone || null, passwordHash: await hashPassword(input.password), roles: [customerRole._id], status: "pending", timezone: input.timezone || "UTC" });
    await sendVerification(user);
    await auditService.record({ request, actor: user._id, action: "auth.register", resourceType: "User", resourceId: user._id });
    await notificationEventService.administrative({ action: "registered", record: user, actorId: user._id });
    return { userId: user.id, email: user.email };
  },

  async verifyEmail(token, request) {
    const tokenHash = hashToken(token);
    const record = await EmailVerificationToken.findOneAndUpdate({ tokenHash, usedAt: null, expiresAt: { $gt: new Date() } }, { $set: { usedAt: new Date() } }, { new: true }).select("+tokenHash");
    if (!record) {
      const usedRecord = await EmailVerificationToken.findOne({ tokenHash, usedAt: { $ne: null } });
      const verifiedUser = usedRecord && await User.findOne({ _id: usedRecord.user, emailVerifiedAt: { $ne: null }, status: "active", deletedAt: null });
      if (verifiedUser) return { email: verifiedUser.email, alreadyVerified: true };
      throw new ApiError(400, "Verification link is invalid or expired", "INVALID_VERIFICATION_TOKEN");
    }
    const user = await User.findByIdAndUpdate(record.user, { $set: { emailVerifiedAt: new Date(), status: "active" } }, { new: true });
    await auditService.record({ request, actor: user._id, action: "auth.email-verified", resourceType: "User", resourceId: user._id });
    await notificationEventService.administrative({ action: "verified email for", record: user, actorId: user._id });
    await notificationEventService.account({ userId: user._id, organization: user.organization, type: "account.email-verified", title: "Welcome to EstateFlow", message: "Your email address is verified and your account is active.", actorId: user._id, includeActor: true });
    return { email: user.email };
  },

  async resendVerification(email) {
    const user = await User.findOne({ email: email.toLowerCase(), status: "pending", deletedAt: null });
    if (user) await sendVerification(user);
  },

  async login(input, request) {
    const email = input.email.toLowerCase();
    const user = await User.findOne({ email, deletedAt: null }).select("+passwordHash +failedLoginAttempts +lockedUntil");
    const history = { user: user?._id || null, email, ipAddress: request.ip, userAgent: request.get("user-agent"), deviceFingerprint: request.get("x-device-fingerprint") || null };
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      if (user) {
        const attempts = user.failedLoginAttempts + 1;
        const update = { failedLoginAttempts: attempts };
        if (attempts >= env.LOGIN_MAX_ATTEMPTS) update.lockedUntil = new Date(Date.now() + env.LOGIN_LOCK_MINUTES * 60000);
        await User.updateOne({ _id: user._id }, { $set: update });
      }
      await LoginHistory.create({ ...history, successful: false, failureReason: "invalid-credentials" });
      throw new ApiError(401, "Email or password is incorrect", "INVALID_CREDENTIALS");
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) throw new ApiError(423, "Account is temporarily locked", "ACCOUNT_LOCKED");
    if (user.status === "pending") throw new ApiError(403, "Verify your email before signing in", "EMAIL_NOT_VERIFIED");
    if (user.status !== "active") throw new ApiError(403, "This account is not active", "ACCOUNT_INACTIVE");
    const newDevice = Boolean(history.deviceFingerprint) && !(await LoginHistory.exists({ user: user._id, successful: true, deviceFingerprint: history.deviceFingerprint }));
    await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), lastSeenAt: new Date() } });
    await LoginHistory.create({ ...history, successful: true });
    const tokens = await createSession({ userId: user._id, rememberMe: input.rememberMe, request });
    const hydrated = await hydratedUser(user._id);
    await auditService.record({ request, actor: user._id, action: "auth.login", resourceType: "User", resourceId: user._id, metadata: { sessionId: tokens.sessionId } });
    await notificationEventService.administrative({ action: "signed in to", record: user, actorId: user._id });
    if (newDevice) await notificationEventService.account({ userId: user._id, organization: user.organization, type: "security.new-device-login", title: "New device sign-in", message: `Your account was accessed from ${history.userAgent || "a new browser or device"}.`, actorId: user._id, includeActor: true });
    return { ...publicSession(hydrated), tokens };
  },

  async refresh(rawRefreshToken, request) {
    const tokens = await rotateSession(rawRefreshToken, request);
    const user = await hydratedUser(tokens.userId);
    if (!user || user.status !== "active" || user.deletedAt) { await revokeAllSessions(tokens.userId, "account-inactive"); throw new ApiError(401, "User session is no longer active", "SESSION_INACTIVE"); }
    return { ...publicSession(user), tokens };
  },

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase(), status: "active", deletedAt: null });
    if (!user) return;
    const token = rawToken();
    await PasswordResetToken.deleteMany({ user: user._id });
    await PasswordResetToken.create({ user: user._id, tokenHash: hashToken(token), expiresAt: tokenExpiry(env.PASSWORD_RESET_TTL_MINUTES) });
    await emailService.sendPasswordReset(user, token);
  },

  async resetPassword(token, password, request) {
    const record = await PasswordResetToken.findOneAndUpdate({ tokenHash: hashToken(token), usedAt: null, expiresAt: { $gt: new Date() } }, { $set: { usedAt: new Date() } }, { new: true }).select("+tokenHash");
    if (!record) throw new ApiError(400, "Password reset link is invalid or expired", "INVALID_RESET_TOKEN");
    await User.updateOne({ _id: record.user }, { $set: { passwordHash: await hashPassword(password), passwordChangedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null } });
    await revokeAllSessions(record.user, "password-reset");
    await auditService.record({ request, actor: record.user, action: "auth.password-reset", resourceType: "User", resourceId: record.user });
    const user = await User.findById(record.user);
    await notificationEventService.administrative({ action: "reset password for", record: user, actorId: record.user });
    await notificationEventService.account({ userId: record.user, type: "security.password-reset", title: "Password reset completed", message: "Your password was reset and all active sessions were revoked.", actorId: record.user, includeActor: true });
  },

  async changePassword(userId, currentPassword, nextPassword, currentSessionId, request) {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) throw new ApiError(400, "Current password is incorrect", "INVALID_CURRENT_PASSWORD");
    if (await verifyPassword(nextPassword, user.passwordHash)) throw new ApiError(400, "New password must be different", "PASSWORD_UNCHANGED");
    await User.updateOne({ _id: userId }, { $set: { passwordHash: await hashPassword(nextPassword), passwordChangedAt: new Date() } });
    await RefreshToken.updateMany({ user: userId, tokenId: { $ne: currentSessionId }, revokedAt: null }, { $set: { revokedAt: new Date(), revokeReason: "password-changed" } });
    await auditService.record({ request, actor: userId, action: "auth.password-changed", resourceType: "User", resourceId: userId });
    await notificationEventService.administrative({ action: "changed password for", record: user, actorId: userId });
    await notificationEventService.account({ userId, organization: user.organization, type: "security.password-changed", title: "Password changed", message: "Your password was changed. Other active sessions were signed out.", actorId: userId, includeActor: true });
  },

  async me(userId) { const user = await hydratedUser(userId); return publicSession(user); },
  async updateProfile(userId, changes, request) {
    const user = await User.findByIdAndUpdate(userId, { $set: { ...changes, ...(changes.phone === "" ? { phone: null } : {}) } }, { new: true, runValidators: true });
    await auditService.record({ request, actor: userId, action: "auth.profile-updated", resourceType: "User", resourceId: userId, metadata: { fields: Object.keys(changes) } });
    await notificationEventService.administrative({ action: "updated profile for", record: user, actorId: userId });
    return user;
  },
  async sessions(userId, currentSessionId) {
    const sessions = await RefreshToken.find({ user: userId, revokedAt: null, expiresAt: { $gt: new Date() } }).sort({ lastUsedAt: -1 }).lean();
    return sessions.map(({ tokenId, familyId, ipAddress, userAgent, deviceFingerprint, createdAt, lastUsedAt, expiresAt }) => ({ id: tokenId, familyId, ipAddress, userAgent, deviceFingerprint, createdAt, lastUsedAt, expiresAt, current: tokenId === currentSessionId }));
  },
  revokeSession(userId, tokenId, reason = "logout") { return RefreshToken.updateOne({ user: userId, tokenId, revokedAt: null }, { $set: { revokedAt: new Date(), revokeReason: reason } }); },
  revokeAllSessions,
};

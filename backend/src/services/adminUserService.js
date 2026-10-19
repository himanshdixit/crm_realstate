import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { auditService } from "./auditService.js";
import { hashPassword } from "../utils/hashing.js";
import { ApiError } from "../utils/ApiError.js";
import { notificationEventService } from "./notificationEventService.js";

async function rolesFromIds(roleIds) {
  const roles = await Role.find({ _id: { $in: roleIds }, isActive: true, deletedAt: null });
  if (roles.length !== new Set(roleIds.map(String)).size) throw new ApiError(422, "One or more selected roles are invalid", "INVALID_ROLE");
  return roles;
}

async function protectLastSuperAdmin(user, nextRoles = [], nextStatus = user.status) {
  const superAdminRole = await Role.findOne({ slug: "super-admin", deletedAt: null }).select("_id").lean();
  if (!superAdminRole || !user.roles.some((id) => String(id) === String(superAdminRole._id))) return;
  const keepsRole = nextRoles.some((id) => String(id) === String(superAdminRole._id));
  if (keepsRole && nextStatus === "active") return;
  const remaining = await User.countDocuments({ _id: { $ne: user._id }, roles: superAdminRole._id, status: "active", deletedAt: null });
  if (!remaining) throw new ApiError(409, "The last active Super Admin cannot be removed or demoted", "LAST_SUPER_ADMIN");
}

function safeUser(user) {
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, fullName: user.fullName, email: user.email, phone: user.phone, avatar: user.avatar, roles: user.roles, status: user.status, emailVerified: Boolean(user.emailVerifiedAt), emailVerifiedAt: user.emailVerifiedAt, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

async function populated(userId) {
  return User.findById(userId).populate("roles", "name slug isSystem isActive");
}

export const adminUserService = {
  async create(data, request) {
    const roles = await rolesFromIds(data.roleIds);
    if (await User.exists({ email: data.email })) throw new ApiError(409, "An account with this email already exists", "EMAIL_IN_USE");
    const user = await User.create({ firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone || null, passwordHash: await hashPassword(data.password), roles: roles.map((role) => role._id), status: data.status || "active", emailVerifiedAt: data.emailVerified === false ? null : new Date(), createdBy: request.auth.userId, updatedBy: request.auth.userId });
    await auditService.record({ request, actor: request.auth.userId, action: "user.created", resourceType: "User", resourceId: user._id, metadata: { roles: roles.map((role) => role.slug) } });
    await notificationEventService.administrative({ action: "created", record: user, actorId: request.auth.userId });
    await notificationEventService.account({ userId: user._id, organization: user.organization, type: "account.created", title: "Your EstateFlow account is ready", message: `A Super Admin created your account with the ${roles.map((role) => role.name).join(", ")} role.`, actorId: request.auth.userId });
    return safeUser(await populated(user._id));
  },

  async update(userId, data, request) {
    const user = await User.findOne({ _id: userId, deletedAt: null });
    if (!user) throw new ApiError(404, "User was not found", "USER_NOT_FOUND");
    if (data.email && data.email !== user.email && await User.exists({ email: data.email, _id: { $ne: user._id } })) throw new ApiError(409, "An account with this email already exists", "EMAIL_IN_USE");
    if (data.roleIds) { const roles = await rolesFromIds(data.roleIds); await protectLastSuperAdmin(user, roles.map((role) => role._id), data.status || user.status); user.roles = roles.map((role) => role._id); }
    else if (data.status && data.status !== user.status) await protectLastSuperAdmin(user, user.roles, data.status);
    for (const field of ["firstName", "lastName", "email", "status"]) if (data[field] !== undefined) user[field] = data[field];
    if (data.phone !== undefined) user.phone = data.phone || null;
    if (data.emailVerified !== undefined) user.emailVerifiedAt = data.emailVerified ? (user.emailVerifiedAt || new Date()) : null;
    user.updatedBy = request.auth.userId;
    await user.save();
    if (data.status && data.status !== "active") await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date(), revokeReason: "Account status changed by Super Admin" } });
    await auditService.record({ request, actor: request.auth.userId, action: "user.updated", resourceType: "User", resourceId: user._id, metadata: { fields: Object.keys(data).filter((key) => key !== "password") } });
    await notificationEventService.administrative({ action: "updated", record: user, actorId: request.auth.userId });
    await notificationEventService.account({ userId: user._id, organization: user.organization, type: "account.updated", title: "Your account was updated", message: "A Super Admin changed your profile, role, verification, or account status.", actorId: request.auth.userId });
    return safeUser(await populated(user._id));
  },

  async setPassword(userId, password, request) {
    const user = await User.findOne({ _id: userId, deletedAt: null });
    if (!user) throw new ApiError(404, "User was not found", "USER_NOT_FOUND");
    user.passwordHash = await hashPassword(password); user.passwordChangedAt = new Date(); user.failedLoginAttempts = 0; user.lockedUntil = null; user.updatedBy = request.auth.userId; await user.save();
    await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date(), revokeReason: "Password changed by Super Admin" } });
    await auditService.record({ request, actor: request.auth.userId, action: "user.password_changed_by_admin", resourceType: "User", resourceId: user._id });
    await notificationEventService.administrative({ action: "password changed", record: user, actorId: request.auth.userId });
    await notificationEventService.account({ userId: user._id, organization: user.organization, type: "security.password-changed-by-admin", title: "Your password was changed", message: "A Super Admin changed your password and signed out your active sessions.", actorId: request.auth.userId });
  },

  async remove(userId, request) {
    const user = await User.findOne({ _id: userId, deletedAt: null });
    if (!user) throw new ApiError(404, "User was not found", "USER_NOT_FOUND");
    if (String(user._id) === String(request.auth.userId)) throw new ApiError(409, "You cannot delete your own active account", "SELF_DELETE_DENIED");
    await protectLastSuperAdmin(user, []);
    user.deletedAt = new Date(); user.deletedBy = request.auth.userId; user.status = "disabled"; user.updatedBy = request.auth.userId; await user.save();
    await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date(), revokeReason: "Account deleted by Super Admin" } });
    await auditService.record({ request, actor: request.auth.userId, action: "user.deleted", resourceType: "User", resourceId: user._id });
    await notificationEventService.administrative({ action: "deleted", record: user, actorId: request.auth.userId });
  },
};

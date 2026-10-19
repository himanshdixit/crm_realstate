import { dashboardRepository } from "../repositories/dashboardRepository.js";
import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";

function scopeFor(user) {
  const roleSlugs = (user.roles || []).map((role) => role.slug);
  return { organization: user.organization || null, userId: user._id, customer: roleSlugs.includes("customer") && !roleSlugs.some((slug) => ["super-admin", "admin", "manager", "sales-manager", "agent"].includes(slug)) };
}

function isSuperAdmin(user) {
  return (user.roles || []).some((role) => role.slug === "super-admin");
}

function serializeAdministration({ users, roles, permissions, statusCounts }) {
  const permissionById = new Map(permissions.map((permission) => [String(permission._id), permission]));
  const roleById = new Map(roles.map((role) => [String(role._id), role]));
  const permissionDetails = (ids = []) => ids.map((id) => permissionById.get(String(id))).filter(Boolean).map(({ _id, key, name, resource, action }) => ({ id: String(_id), key, name, resource, action }));
  const roleDetails = roles.map((role) => ({
    id: String(role._id), name: role.name, slug: role.slug, description: role.description,
    isSystem: role.isSystem, isActive: role.isActive,
    permissions: permissionDetails(role.permissions),
  }));

  const accountDetails = users.map((user) => {
    const assignedRoles = (user.roles || []).map((id) => roleById.get(String(id))).filter(Boolean);
    const deniedKeys = new Set(permissionDetails(user.deniedPermissions).map((permission) => permission.key));
    const effective = new Map();
    assignedRoles.forEach((role) => permissionDetails(role.permissions).forEach((permission) => effective.set(permission.key, permission)));
    permissionDetails(user.directPermissions).forEach((permission) => effective.set(permission.key, permission));
    deniedKeys.forEach((key) => effective.delete(key));
    const hasWildcard = effective.has("*");
    const effectivePermissions = hasWildcard ? [{ key: "*", name: "All permissions", resource: "*", action: "*" }] : [...effective.values()].sort((left, right) => left.key.localeCompare(right.key));
    return {
      id: String(user._id), firstName: user.firstName, lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(), email: user.email, phone: user.phone,
      avatar: user.avatar, status: user.status, emailVerified: Boolean(user.emailVerifiedAt),
      emailVerifiedAt: user.emailVerifiedAt, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt,
      roles: assignedRoles.map(({ _id, name, slug, isSystem, isActive }) => ({ id: String(_id), name, slug, isSystem, isActive })),
      directPermissions: permissionDetails(user.directPermissions), deniedPermissions: permissionDetails(user.deniedPermissions),
      effectivePermissions,
    };
  });
  const adminUsers = accountDetails.filter((account) => account.roles.some((role) => role.slug === "admin"));
  return {
    summary: {
      totalUsers: accountDetails.length,
      normalAdmins: adminUsers.length,
      superAdmins: accountDetails.filter((account) => account.roles.some((role) => role.slug === "super-admin")).length,
      roles: roleDetails.length,
      permissions: permissions.length,
      byStatus: Object.fromEntries(statusCounts.map(({ _id, count }) => [_id || "unknown", count])),
    },
    adminUsers,
    users: accountDetails,
    roles: roleDetails,
    permissions: permissions.map(({ _id, key, name, description, resource, action, isSystem, isActive }) => ({ id: String(_id), key, name, description, resource, action, isSystem, isActive })),
  };
}

function fillMonths(rows, months) {
  const indexed = new Map(rows.map((row) => [`${row._id.year}-${row._id.month}`, row]));
  const output = [];
  const cursor = new Date(); cursor.setUTCDate(1); cursor.setUTCHours(0, 0, 0, 0); cursor.setUTCMonth(cursor.getUTCMonth() - months + 1);
  for (let index = 0; index < months; index += 1) {
    const year = cursor.getUTCFullYear(); const month = cursor.getUTCMonth() + 1; const row = indexed.get(`${year}-${month}`);
    output.push({ year, month, amountMinor: row?.amountMinor || 0, payments: row?.payments || 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return output;
}

export const dashboardService = {
  async overview(user, months = 12) {
    const scope = scopeFor(user);
    const [summary, revenueRows, propertyStatus, leadFunnel, leadSources, topAgents, work, activities, recentTransactions, notifications] = await Promise.all([
      dashboardRepository.summary(scope), dashboardRepository.revenue(scope, months), dashboardRepository.groupCounts(Property, scope, "status"), dashboardRepository.groupCounts(Lead, scope, "status"), dashboardRepository.groupCounts(Lead, scope, "source"), dashboardRepository.topAgents(scope), dashboardRepository.work(scope), dashboardRepository.activity(scope), dashboardRepository.recentTransactions(scope), dashboardRepository.notifications(scope),
    ]);
    const administration = isSuperAdmin(user) ? serializeAdministration(await dashboardRepository.administration()) : undefined;
    return { audience: scope.customer ? "customer" : "internal", generatedAt: new Date().toISOString(), summary, revenue: fillMonths(revenueRows, months), propertyStatus: propertyStatus.map(({ _id, count }) => ({ status: _id || "unknown", count })), leadFunnel: leadFunnel.map(({ _id, count }) => ({ status: _id || "unknown", count })), leadSources: leadSources.map(({ _id, count }) => ({ source: _id || "other", count })), topAgents, today: work, recentActivities: activities, recentTransactions, notifications, ...(administration ? { administration } : {}) };
  },
};

export const dashboardHelpers = { fillMonths, scopeFor, isSuperAdmin, serializeAdministration };

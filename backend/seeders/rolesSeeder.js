import { SYSTEM_ROLES } from "../src/constants/roles.js";
import { Permission } from "../src/models/Permission.js";
import { Role } from "../src/models/Role.js";

const roleAccess = {
  [SYSTEM_ROLES.SUPER_ADMIN]: ["*"],
  [SYSTEM_ROLES.ADMIN]: ["*"],
  [SYSTEM_ROLES.MANAGER]: ["dashboard.read", "properties.", "projects.", "builders.", "leads.", "customers.", "visits.", "bookings.", "tasks.", "appointments.", "invoices.", "payments.read", "reports.", "documents."],
  [SYSTEM_ROLES.SALES_MANAGER]: ["dashboard.read", "properties.read", "leads.", "customers.", "visits.", "bookings.", "tasks.", "appointments.", "reports."],
  [SYSTEM_ROLES.AGENT]: ["dashboard.read", "properties.read", "leads.read", "leads.update", "customers.read", "customers.update", "visits.", "bookings.read", "bookings.create", "tasks.", "appointments."],
  [SYSTEM_ROLES.TELECALLER]: ["dashboard.read", "properties.read", "leads.read", "leads.update", "tasks.", "appointments."],
  [SYSTEM_ROLES.MARKETING]: ["dashboard.read", "properties.read", "leads.read", "reports.read", "reports.export", "notifications.manage", "marketing.", "content."],
  [SYSTEM_ROLES.ACCOUNTANT]: ["dashboard.read", "bookings.read", "invoices.", "payments.", "reports.read", "reports.export"],
  [SYSTEM_ROLES.CUSTOMER_SUPPORT]: ["dashboard.read", "properties.read", "leads.read", "customers.read", "customers.update", "documents.read", "notifications.manage", "support."],
  [SYSTEM_ROLES.BUILDER]: ["dashboard.read", "properties.read", "properties.create", "properties.update", "projects.", "leads.read", "reports.read"],
  [SYSTEM_ROLES.CUSTOMER]: ["dashboard.read", "properties.read", "visits.read", "visits.create", "bookings.read", "documents.read"],
  [SYSTEM_ROLES.GUEST]: ["properties.read"],
};

function matches(key, patterns) {
  return patterns.includes("*") || patterns.some((pattern) => pattern.endsWith(".") ? key.startsWith(pattern) : key === pattern);
}

export async function seedRoles() {
  const permissions = await Permission.find({ isActive: true }).lean();
  const operations = Object.values(SYSTEM_ROLES).map((slug) => ({
    updateOne: {
      filter: { organization: null, slug },
      update: {
        $set: {
          name: slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
          description: `System role for ${slug.replaceAll("-", " ")} users`,
          permissions: permissions.filter(({ key }) => matches(key, roleAccess[slug])).map(({ _id }) => _id),
          isSystem: true,
          isActive: true,
          deletedAt: null,
        },
      },
      upsert: true,
    },
  }));
  await Role.bulkWrite(operations);
  return Role.find({ organization: null, isSystem: true });
}

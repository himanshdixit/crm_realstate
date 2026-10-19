import { Booking } from "../models/Booking.js";
import { Chat } from "../models/ExtendedCrmModels.js";
import { Notification } from "../models/Notification.js";
import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import { logger } from "../config/logger.js";

const recipientFields = Object.freeze({
  properties: ["assignedAgent"], leads: ["assignedTo"], tasks: ["assignee"], appointments: ["owner"],
  visits: ["agent"], bookings: ["agent"], "support-tickets": ["requester", "assignee"], enquiries: ["assignedTo"],
  chats: ["participants"], favorites: ["user"],
});
const labels = Object.freeze({ created: "created", updated: "updated", deleted: "deleted", restored: "restored", converted: "converted", confirmed: "confirmed", cancelled: "cancelled", featured: "featured", unfeatured: "unfeatured" });
const audienceRoles = Object.freeze({
  enquiries: ["super-admin", "admin", "manager", "sales-manager", "telecaller"],
  payments: ["super-admin", "admin", "accountant"], invoices: ["super-admin", "admin", "accountant"],
  campaigns: ["super-admin", "admin", "marketing"],
});

function ids(values) {
  return [...new Set(values.flat().filter(Boolean).map((value) => String(value?._id || value)))];
}
function recordName(resource, record) {
  return record?.title || record?.name || record?.subject || record?.reference || record?.number || [record?.firstName, record?.lastName].filter(Boolean).join(" ") || resource.split("-").join(" ");
}
function safeLink(resource, record) {
  const name = recordName(resource, record);
  return `/${resource}?search=${encodeURIComponent(name)}`;
}

async function superAdminIds() {
  const roles = await Role.find({ slug: "super-admin", isActive: true, deletedAt: null }).select("_id").lean();
  if (!roles.length) return [];
  const users = await User.find({ roles: { $in: roles.map((role) => role._id) }, status: "active", deletedAt: null }).select("_id").lean();
  return ids(users.map((user) => user._id));
}

async function actorName(actorId) {
  if (!actorId) return "A system process";
  const actor = await User.findById(actorId).select("firstName lastName email").lean();
  return actor ? `${actor.firstName} ${actor.lastName}`.trim() || actor.email : "A user";
}

async function recipientsFor(resource, record) {
  const direct = (recipientFields[resource] || []).flatMap((field) => record?.[field] || []);
  if (resource === "messages" && record?.chat) {
    const chat = await Chat.findById(record.chat).select("participants").lean();
    return ids([...(chat?.participants || []), ...direct]).filter((id) => id !== String(record.sender));
  }
  if (["payments", "invoices"].includes(resource) && record?.booking) {
    const booking = await Booking.findById(record.booking).select("agent").lean();
    return ids([...direct, booking?.agent]);
  }
  const roleSlugs = audienceRoles[resource] || [];
  if (!roleSlugs.length) return ids(direct);
  const roles = await Role.find({ slug: { $in: roleSlugs }, isActive: true, deletedAt: null }).select("_id").lean();
  const audience = roles.length ? await User.find({ organization: record.organization || null, roles: { $in: roles.map((role) => role._id) }, status: "active", deletedAt: null }).select("_id").lean() : [];
  return ids([...direct, ...audience.map((user) => user._id)]);
}

async function createMany({ recipients, actorId, includeActor = false, alwaysInclude = [], organization = null, type, title, message, link, dedupePrefix }) {
  const mandatory = new Set(ids(alwaysInclude));
  const targets = ids(recipients).filter((id) => includeActor || id !== String(actorId || "") || mandatory.has(id));
  if (!targets.length) return 0;
  if (dedupePrefix) {
    const results = await Promise.all(targets.map((user) => Notification.updateOne({ dedupeKey: `${dedupePrefix}:${user}` }, { $setOnInsert: { user, organization, type, title, message, link, dedupeKey: `${dedupePrefix}:${user}` } }, { upsert: true })));
    return results.reduce((sum, result) => sum + (result.upsertedCount || 0), 0);
  }
  await Notification.insertMany(targets.map((user) => ({ user, organization, type, title, message, link })), { ordered: false });
  return targets.length;
}

export const notificationEventService = {
  async resource({ resource, action, record, actorId }) {
    try {
      if (!record || resource === "notifications") return 0;
      const [recipients, administrators, actor] = await Promise.all([recipientsFor(resource, record), superAdminIds(), actorName(actorId)]);
      const name = recordName(resource, record);
      const verb = labels[action] || action;
      return await createMany({ recipients: [...recipients, ...administrators], alwaysInclude: administrators, actorId, organization: record.organization || null, type: `${resource}.${action}`, title: `${name} ${verb}`, message: `${actor} ${verb} the ${resource.split("-").join(" ")} record “${name}”.`, link: safeLink(resource, record) });
    } catch (error) {
      logger.warn("Automatic resource notification failed", { error, resource, action, resourceId: record?._id });
      return 0;
    }
  },

  async administrative({ action, record, actorId, organization = record?.organization || null }) {
    try {
      if (!record) return 0;
      const [administrators, actor] = await Promise.all([superAdminIds(), actorName(actorId)]);
      const name = recordName("users", record);
      const verb = labels[action] || action.split(".").join(" ");
      return await createMany({ recipients: administrators, alwaysInclude: administrators, actorId, organization, type: `users.${action}`, title: `User ${verb}: ${name}`, message: `${actor} ${verb} the user account “${name}”.`, link: "/dashboard", dedupePrefix: `admin:${action}:${record._id}:${record.updatedAt?.toISOString?.() || Date.now()}` });
    } catch (error) {
      logger.warn("Super Admin activity notification failed", { error, action, resourceId: record?._id });
      return 0;
    }
  },

  async account({ userId, organization = null, type, title, message, actorId, includeActor = false }) {
    try { return await createMany({ recipients: [userId], actorId, includeActor, organization, type, title, message, link: "/profile" }); }
    catch (error) { logger.warn("Automatic account notification failed", { error, type, userId }); return 0; }
  },

  async reminder({ userId, organization = null, type, title, message, link, dedupeKey }) {
    try { return await createMany({ recipients: [userId], includeActor: true, organization, type, title, message, link, dedupePrefix: dedupeKey }); }
    catch (error) { logger.warn("Automatic reminder notification failed", { error, type, userId }); return 0; }
  },
};

export const notificationEventHelpers = { ids, recordName, safeLink };

import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { Builder } from "../models/Builder.js";
import { Customer } from "../models/Customer.js";
import { Lead } from "../models/Lead.js";
import { Project } from "../models/Project.js";
import { Property } from "../models/Property.js";
import { User } from "../models/User.js";
import { Chat } from "../models/ExtendedCrmModels.js";

const id = (record) => String(record._id);
const shortId = (record) => id(record).slice(-6).toUpperCase();
const configs = {
  users: { model: User, search: ["firstName", "lastName", "email", "phone"], select: "firstName lastName email phone status roles", populate: { path: "roles", select: "name slug" }, format: (record) => ({ id: id(record), label: `${record.firstName} ${record.lastName}`.trim(), description: [record.email, record.roles?.map((role) => role.name).join(", ")].filter(Boolean).join(" · "), status: record.status }) },
  customers: { model: Customer, search: ["firstName", "lastName", "email", "phone"], select: "firstName lastName email phone status", format: (record) => ({ id: id(record), label: `${record.firstName} ${record.lastName}`.trim(), description: record.email || record.phone || "Customer", status: record.status }) },
  properties: { model: Property, search: ["title", "reference", "city", "address"], select: "title reference city status", format: (record) => ({ id: id(record), label: record.title, description: [record.reference, record.city].filter(Boolean).join(" · "), status: record.status }) },
  leads: { model: Lead, search: ["name", "email", "phone"], select: "name email phone status", format: (record) => ({ id: id(record), label: record.name, description: record.email || record.phone || "Lead", status: record.status }) },
  builders: { model: Builder, search: ["name", "email", "phone"], select: "name email phone status", format: (record) => ({ id: id(record), label: record.name, description: record.email || record.phone || "Builder", status: record.status }) },
  projects: { model: Project, search: ["name", "city", "area"], select: "name city area status", format: (record) => ({ id: id(record), label: record.name, description: [record.city, record.area].filter(Boolean).join(" · "), status: record.status }) },
  bookings: { model: Booking, search: [], select: "status currency totalMinor bookedAt", format: (record) => ({ id: id(record), label: `Booking ${shortId(record)}`, description: `${record.status} · ${record.currency} ${((record.totalMinor || 0) / 100).toLocaleString("en-IN")}`, status: record.status }) },
  chats: { model: Chat, search: ["title"], select: "title lastMessageAt", format: (record) => ({ id: id(record), label: record.title || `Chat ${shortId(record)}`, description: "Conversation" }) },
};

export const lookupRegistry = Object.freeze(configs);
export function lookupFilter(config, auth, query) {
  const filter = { organization: auth.user.organization || null, deletedAt: null };
  const terms = [];
  if (query) {
    const expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    terms.push(...config.search.map((field) => ({ [field]: expression })));
    if (mongoose.isValidObjectId(query)) terms.push({ _id: query });
  }
  if (terms.length) filter.$or = terms;
  return filter;
}

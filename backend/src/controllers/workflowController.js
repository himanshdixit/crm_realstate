import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { Customer } from "../models/Customer.js";
import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/ApiResponse.js";
import { notificationEventService } from "../services/notificationEventService.js";

const leadStages = ["new", "contacted", "qualified", "proposal", "negotiation", "converted", "lost"];

export async function leadPipeline(request, response) {
  const organization = request.auth.user.organization || null;
  const rows = await Lead.find({ organization, deletedAt: null })
    .select("name email phone source score status assignedTo createdAt")
    .sort({ score: -1, createdAt: -1 }).limit(700).populate("assignedTo", "firstName lastName").lean();
  const stages = Object.fromEntries(leadStages.map((stage) => [stage, []]));
  rows.forEach((lead) => { if (stages[lead.status]) stages[lead.status].push(lead); });
  response.json(successResponse({ data: { stages, total: rows.length } }));
}

function validId(id) { if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid identifier", "INVALID_IDENTIFIER"); return id; }
function scope(request) { return { organization: request.auth.user.organization || null, deletedAt: null }; }
export async function convertLead(request, response) {
  const lead = await Lead.findOne({ ...scope(request), _id: validId(request.params.id), status: { $nin: ["converted", "lost"] } });
  if (!lead) throw new ApiError(404, "Convertible lead was not found", "RESOURCE_NOT_FOUND");
  const [firstName, ...lastParts] = lead.name.trim().split(/\s+/);
  const customer = await Customer.create({ organization: lead.organization, firstName, lastName: lastParts.join(" ") || "Customer", email: lead.email, phone: lead.phone || `lead-${lead._id}`, status: "active", assignedAgent: lead.assignedTo, sourceLead: lead._id, createdBy: request.auth.userId, updatedBy: request.auth.userId });
  lead.status = "converted"; lead.convertedAt = new Date(); lead.updatedBy = request.auth.userId; await lead.save();
  await notificationEventService.resource({ resource: "leads", action: "converted", record: lead, actorId: request.auth.userId });
  response.status(201).json(successResponse({ message: "Lead converted to customer", data: { lead, customer } }));
}
export async function bookingStatus(request, response) { const status = request.path.endsWith("/approve") ? "confirmed" : "cancelled"; const booking = await Booking.findOneAndUpdate({ ...scope(request), _id: validId(request.params.id) }, { $set: { status, updatedBy: request.auth.userId } }, { new: true }); if (!booking) throw new ApiError(404, "Booking was not found", "RESOURCE_NOT_FOUND"); await notificationEventService.resource({ resource: "bookings", action: status, record: booking, actorId: request.auth.userId }); response.json(successResponse({ message: `Booking ${status}`, data: booking })); }
export async function featureProperty(request, response) { const property = await Property.findOneAndUpdate({ ...scope(request), _id: validId(request.params.id) }, { $set: { featured: Boolean(request.body.featured), updatedBy: request.auth.userId } }, { new: true }); if (!property) throw new ApiError(404, "Property was not found", "RESOURCE_NOT_FOUND"); await notificationEventService.resource({ resource: "properties", action: property.featured ? "featured" : "unfeatured", record: property, actorId: request.auth.userId }); response.json(successResponse({ message: property.featured ? "Property featured" : "Property unfeatured", data: property })); }

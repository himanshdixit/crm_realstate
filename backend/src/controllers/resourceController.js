import mongoose from "mongoose";
import { resourceRegistry } from "../config/resourceRegistry.js";
import { Activity } from "../models/Activity.js";
import { ResourceRepository } from "../repositories/resourceRepository.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/ApiResponse.js";
import { notificationEventService } from "../services/notificationEventService.js";

function context(request, action) {
  const resource = resourceRegistry[request.params.resource];
  if (!resource) throw new ApiError(404, "CRM resource was not found", "RESOURCE_NOT_FOUND");
  if (!request.auth.permissions.includes(`${resource.permission}.${action}`)) throw new ApiError(403, "You do not have permission to perform this action", "PERMISSION_DENIED");
  return { resource, repository: new ResourceRepository(resource) };
}
function id(value) { if (!mongoose.isValidObjectId(value)) throw new ApiError(400, "Invalid resource identifier", "INVALID_IDENTIFIER"); return value; }
function pick(body, fields) { return Object.fromEntries(Object.entries(body || {}).filter(([key]) => fields.includes(key))); }
async function activity(request, action, record) { await Activity.create({ organization: request.auth.user.organization || null, actor: request.auth.userId, type: `${request.params.resource}.${action}`, title: `${request.params.resource} ${action}`, resourceType: request.params.resource, resourceId: record?._id, occurredAt: new Date() }); }
async function notify(request, action, record) { await notificationEventService.resource({ resource: request.params.resource, action, record, actorId: request.auth.userId }); }

export async function list(request, response) { const { repository } = context(request, "read"); const result = await repository.list(request.auth, request.query); response.json(successResponse({ data: result.items, meta: result.meta })); }
export async function get(request, response) { const { repository } = context(request, "read"); const record = await repository.find(request.auth, id(request.params.id)); if (!record) throw new ApiError(404, "Resource was not found", "RESOURCE_NOT_FOUND"); response.json(successResponse({ data: record })); }
export async function create(request, response) { const { resource, repository } = context(request, "create"); const values = pick(request.body, resource.fields); if (!Object.keys(values).length) throw new ApiError(422, "No supported fields were provided", "VALIDATION_ERROR"); const record = await repository.create(request.auth, values); await activity(request, "created", record); await notify(request, "created", record); response.status(201).json(successResponse({ message: "Resource created", data: record })); }
export async function update(request, response) { const { resource, repository } = context(request, "update"); const values = pick(request.body, resource.fields); if (!Object.keys(values).length) throw new ApiError(422, "No supported fields were provided", "VALIDATION_ERROR"); const record = await repository.update(request.auth, id(request.params.id), values); if (!record) throw new ApiError(404, "Resource was not found", "RESOURCE_NOT_FOUND"); await activity(request, "updated", record); await notify(request, "updated", record); response.json(successResponse({ message: "Resource updated", data: record })); }
export async function remove(request, response) { const { repository } = context(request, "delete"); const record = await repository.remove(request.auth, id(request.params.id)); if (!record) throw new ApiError(404, "Resource was not found", "RESOURCE_NOT_FOUND"); await activity(request, "deleted", record); await notify(request, "deleted", record); response.json(successResponse({ message: "Resource deleted", data: record })); }
export async function restore(request, response) { const { repository } = context(request, "restore"); const record = await repository.restore(request.auth, id(request.params.id)); if (!record) throw new ApiError(404, "Deleted resource was not found", "RESOURCE_NOT_FOUND"); await activity(request, "restored", record); await notify(request, "restored", record); response.json(successResponse({ message: "Resource restored", data: record })); }
export async function bulkRemove(request, response) { const { repository } = context(request, "delete"); const ids = (request.body.ids || []).slice(0, 100).map(id); if (!ids.length) throw new ApiError(422, "At least one identifier is required", "VALIDATION_ERROR"); const result = await repository.bulkRemove(request.auth, ids); response.json(successResponse({ message: `${result.modifiedCount} resources deleted`, data: { modifiedCount: result.modifiedCount } })); }
export async function bulkUpdate(request, response) { const { resource, repository } = context(request, "update"); const ids = (request.body.ids || []).slice(0, 100).map(id); const values = pick(request.body.changes, resource.fields); if (!ids.length || !Object.keys(values).length) throw new ApiError(422, "Identifiers and supported changes are required", "VALIDATION_ERROR"); const result = await repository.bulkUpdate(request.auth, ids, values); response.json(successResponse({ message: `${result.modifiedCount} resources updated`, data: { modifiedCount: result.modifiedCount } })); }

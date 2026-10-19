import { lookupRegistry, lookupFilter } from "../config/lookupRegistry.js";
import { resourceRegistry } from "../config/resourceRegistry.js";
import { Role } from "../models/Role.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/ApiResponse.js";

export async function list(request, response) {
  const config = lookupRegistry[request.validated.type];
  const context = resourceRegistry[request.validated.context];
  if (!config || !context) throw new ApiError(404, "Lookup source was not found", "LOOKUP_NOT_FOUND");
  const allowed = [`${context.permission}.create`, `${context.permission}.update`].some((permission) => request.auth.permissions.includes(permission));
  if (!allowed) throw new ApiError(403, "You do not have permission to use this form lookup", "PERMISSION_DENIED");
  const selectedIds = request.validated.ids || [];
  const filter = lookupFilter(config, request.auth, request.validated.q || "");
  const selectedFilter = { ...lookupFilter(config, request.auth, ""), _id: { $in: selectedIds } };
  if (request.validated.type === "users") {
    filter.status = "active";
    selectedFilter.status = "active";
    if (request.validated.role) { const role = await Role.findOne({ slug: request.validated.role, isActive: true, deletedAt: null }).select("_id").lean(); filter.roles = role?._id || null; selectedFilter.roles = role?._id || null; }
  }
  const find = (conditions, limit) => {
    let query = config.model.find(conditions).select(config.select).sort({ updatedAt: -1, createdAt: -1 }).limit(limit).maxTimeMS(5000);
    if (config.populate) query = query.populate(config.populate);
    return query.lean();
  };
  const [records, selectedRecords] = await Promise.all([find(filter, request.validated.limit || 20), selectedIds.length ? find(selectedFilter, selectedIds.length) : []]);
  const merged = [...new Map([...selectedRecords, ...records].map((record) => [String(record._id), record])).values()];
  response.set("Cache-Control", "private, max-age=30");
  response.json(successResponse({ message: "Lookup options loaded", data: merged.map(config.format) }));
}

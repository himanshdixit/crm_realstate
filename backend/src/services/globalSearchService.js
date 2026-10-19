import { resourceRegistry } from "../config/resourceRegistry.js";
import { escapeRegExp } from "../utils/queryBuilder.js";

function readableResource(resource) {
  return resource.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function textValue(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join(", ");
  if (typeof value === "object") return "";
  return String(value);
}

function resultFromRecord(resource, config, record, query) {
  const values = config.searchFields.map((field) => ({ field, value: textValue(record[field]) })).filter(({ value }) => value);
  const title = values[0]?.value || `${readableResource(resource)} record`;
  const subtitle = values.slice(1, 3).map(({ value }) => value).join(" · ");
  return { id: String(record._id), title, subtitle, status: textValue(record.status), href: `/${resource}?search=${encodeURIComponent(query)}` };
}

export const globalSearchService = {
  async search(auth, query, limit = 12) {
    const granted = new Set(auth.permissions || []);
    const searchable = Object.entries(resourceRegistry).filter(([, config]) => config.searchFields.length && granted.has(`${config.permission}.read`));
    const expression = new RegExp(escapeRegExp(query), "i");
    const perResource = Math.max(2, Math.min(5, Math.ceil(limit / Math.max(searchable.length, 1))));
    const groups = await Promise.all(searchable.map(async ([resource, config]) => {
      const filter = { organization: auth.user.organization || null, deletedAt: null, $or: config.searchFields.map((field) => ({ [field]: expression })) };
      const fields = [...new Set(["_id", "status", ...config.searchFields])].join(" ");
      const records = await config.model.find(filter).select(fields).sort({ updatedAt: -1, createdAt: -1 }).limit(perResource).maxTimeMS(5000).lean();
      return { resource, label: readableResource(resource), items: records.map((record) => resultFromRecord(resource, config, record, query)) };
    }));
    const populated = groups.filter(({ items }) => items.length);
    let remaining = limit;
    const limitedGroups = populated.map((group) => { const items = group.items.slice(0, remaining); remaining -= items.length; return { ...group, items }; }).filter(({ items }) => items.length);
    return { query, groups: limitedGroups, total: limitedGroups.reduce((sum, group) => sum + group.items.length, 0) };
  },
};

export const globalSearchHelpers = { readableResource, textValue, resultFromRecord };

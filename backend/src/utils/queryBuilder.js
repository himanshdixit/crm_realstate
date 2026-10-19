const SORT_FIELD_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.]*$/;

export function buildSort(sortValue, allowedFields, fallback = { createdAt: -1, _id: -1 }) {
  if (!sortValue) return fallback;

  const sort = {};
  for (const token of String(sortValue).split(",")) {
    const descending = token.startsWith("-");
    const field = descending ? token.slice(1) : token;
    if (SORT_FIELD_PATTERN.test(field) && allowedFields.includes(field)) {
      sort[field] = descending ? -1 : 1;
    }
  }

  if (Object.keys(sort).length === 0) return fallback;
  if (!("_id" in sort)) sort._id = -1;
  return sort;
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

import { apiClient } from "./apiClient";

export const lookupService = Object.freeze({
  async list(type, { context, search = "", ids = [], role, limit = 20 }) {
    const { data } = await apiClient.get(`/lookups/${type}`, { params: { context, q: search || undefined, ids: ids.length ? ids.join(",") : undefined, role: role || undefined, limit } });
    return data.data;
  },
});

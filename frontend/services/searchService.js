import { apiClient } from "./apiClient";

export const searchService = Object.freeze({
  async global(query, limit = 12) {
    const { data } = await apiClient.get("/search", { params: { q: query, limit } });
    return data.data;
  },
});

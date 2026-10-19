import { apiClient } from "./apiClient";

export const dashboardService = Object.freeze({
  async overview(months = 12) {
    const { data } = await apiClient.get("/dashboard/overview", { params: { months } });
    return data.data;
  },
  async createUser(payload) { const { data } = await apiClient.post("/dashboard/users", payload); return data; },
  async updateUser(userId, payload) { const { data } = await apiClient.patch(`/dashboard/users/${userId}`, payload); return data; },
  async setUserPassword(userId, password) { const { data } = await apiClient.patch(`/dashboard/users/${userId}/password`, { password }); return data; },
  async deleteUser(userId) { const { data } = await apiClient.delete(`/dashboard/users/${userId}`); return data; },
});

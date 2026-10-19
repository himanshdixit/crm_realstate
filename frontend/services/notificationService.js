import { apiClient } from "./apiClient";

export const notificationService = Object.freeze({
  async inbox(params = {}) { const { data } = await apiClient.get("/notifications/inbox", { params }); return { ...data.data, meta: data.meta }; },
  async markRead(notificationId) { const { data } = await apiClient.patch(`/notifications/inbox/${notificationId}/read`); return data.data; },
  async markAllRead() { const { data } = await apiClient.patch("/notifications/inbox/read-all"); return data.data; },
  async dismiss(notificationId) { const { data } = await apiClient.delete(`/notifications/inbox/${notificationId}`); return data; },
});

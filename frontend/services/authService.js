import { apiClient } from "./apiClient";

export const authService = Object.freeze({
  async login(credentials) {
    const { data } = await apiClient.post("/auth/login", credentials, { skipAuthRefresh: true });
    return data.data;
  },
  async register(values) {
    const { data } = await apiClient.post("/auth/register", values, { skipAuthRefresh: true });
    return data.data;
  },
  async currentUser() {
    const { data } = await apiClient.get("/auth/me");
    return data.data;
  },
  async logout() {
    await apiClient.post("/auth/logout");
  },
  async logoutAll() { await apiClient.post("/auth/logout-all"); },
  async forgotPassword(email) {
    const { data } = await apiClient.post("/auth/forgot-password", { email }, { skipAuthRefresh: true });
    return data;
  },
  async resetPassword(token, password) { const { data } = await apiClient.post("/auth/reset-password", { token, password }, { skipAuthRefresh: true }); return data; },
  async verifyEmail(token) { const { data } = await apiClient.post("/auth/verify-email", { token }, { skipAuthRefresh: true }); return data; },
  async resendVerification(email) { const { data } = await apiClient.post("/auth/resend-verification", { email }, { skipAuthRefresh: true }); return data; },
  async changePassword(values) { const { data } = await apiClient.post("/auth/change-password", values); return data; },
  async updateProfile(values) { const { data } = await apiClient.patch("/auth/profile", values); return data.data; },
  async sessions() { const { data } = await apiClient.get("/auth/sessions"); return data.data; },
  async revokeSession(sessionId) { await apiClient.delete(`/auth/sessions/${sessionId}`); },
});

import axios from "axios";
import { siteConfig } from "@/config/site";
import Cookies from "js-cookie";

export const apiClient = axios.create({
  baseURL: siteConfig.apiUrl,
  timeout: 20_000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const csrfToken = Cookies.get("crm_csrf");
    if (csrfToken) config.headers.set("X-CSRF-Token", csrfToken);
    let fingerprint = window.localStorage.getItem("estateflow-device-id");
    if (!fingerprint) {
      fingerprint = window.crypto.randomUUID();
      window.localStorage.setItem("estateflow-device-id", fingerprint);
    }
    config.headers.set("X-Device-Fingerprint", fingerprint);
  }
  return config;
});

let refreshRequest = null;

function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = apiClient.post("/auth/refresh", null, { skipAuthRefresh: true })
      .finally(() => { refreshRequest = null; });
  }
  return refreshRequest;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const refreshableCodes = ["TOKEN_EXPIRED", "AUTHENTICATION_REQUIRED", "INVALID_TOKEN"];
    const isExpired = error.response?.status === 401 && refreshableCodes.includes(error.response?.data?.code);
    if (!request || request.skipAuthRefresh || request._retried || !isExpired) return Promise.reject(error);

    request._retried = true;
    await refreshSession();
    return apiClient(request);
  },
);

export function apiErrorMessage(error, fallback = "The request could not be completed") {
  if (error.code === "ERR_NETWORK" || !error.response) return `Cannot reach the CRM API at ${siteConfig.apiUrl}. Start the backend and confirm its URL/CORS configuration.`;
  return error.response?.data?.message || error.message || fallback;
}

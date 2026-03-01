import axios from "axios";

const normalizeApiBaseUrl = (value) => {
  if (!value) return "";
  const trimmed = value.replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) {
    return trimmed;
  }
  return `${trimmed}/api`;
};

const isLocalHostname = (hostname) => hostname === "localhost" || hostname === "127.0.0.1";

const getLocalApiBaseUrl = () => {
  const { protocol, hostname } = window.location;
  const apiPort = import.meta.env.VITE_API_PORT || "4000";
  return `${protocol}//${hostname}:${apiPort}/api`;
};

const getDefaultApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const { hostname } = window.location;

    if (isLocalHostname(hostname)) {
      return getLocalApiBaseUrl();
    }
  }

  return "https://misscake-sdr.onrender.com/api";
};

const forceRemoteApi = import.meta.env.VITE_USE_REMOTE_API === "true";
const envApiUrl = import.meta.env.VITE_API_URL;

const RAW_API_URL =
  typeof window !== "undefined" && isLocalHostname(window.location.hostname) && !forceRemoteApi
    ? getLocalApiBaseUrl()
    : envApiUrl || getDefaultApiBaseUrl();

export const API_BASE_URL = normalizeApiBaseUrl(RAW_API_URL);
export const SERVER_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.startsWith("/login") || currentPath.startsWith("/register");
    const isAuthAction =
      error?.config?.url?.includes("/auth/login") || error?.config?.url?.includes("/auth/register");
    const isSessionProbe = error?.config?.url?.includes("/auth/me");

    if (status === 401 && !isAuthPage && !isAuthAction && !isSessionProbe) {
      window.location.href = "/login";
    }

    if (!error.response && error.code === "ECONNABORTED") {
      error.message = "Server response timeout";
    } else if (!error.response) {
      error.message = "Network error: backend unavailable or connection lost";
    }

    return Promise.reject(error);
  }
);

export default api;

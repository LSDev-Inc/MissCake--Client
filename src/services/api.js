import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://misscake-sdr.onrender.com/api";

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

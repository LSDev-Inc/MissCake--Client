const RAW_API_URL = import.meta.env.VITE_API_URL || "https://misscake-sdr.onrender.com/api";

const normalizeApiBaseUrl = (value) => {
  if (!value) return "";
  const trimmed = value.replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) {
    return trimmed;
  }
  return `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(RAW_API_URL);
const SERVER_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export const resolveImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${SERVER_ORIGIN}${value}`;
  return `${SERVER_ORIGIN}/${value}`;
};

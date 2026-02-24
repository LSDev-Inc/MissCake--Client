const API_BASE_URL = import.meta.env.VITE_API_URL || "https://misscake-sdr.onrender.com/api";
const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const resolveImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${SERVER_ORIGIN}${value}`;
  return `${SERVER_ORIGIN}/${value}`;
};

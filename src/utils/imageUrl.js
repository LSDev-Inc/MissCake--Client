import { SERVER_ORIGIN } from "../services/api";

export const resolveImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${SERVER_ORIGIN}${value}`;
  return `${SERVER_ORIGIN}/${value}`;
};

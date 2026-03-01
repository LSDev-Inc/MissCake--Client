import { SERVER_ORIGIN } from "../services/api";

export const FALLBACK_IMAGE_URL = "/miss-cake.png";

export const resolveImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${SERVER_ORIGIN}${value}`;
  return `${SERVER_ORIGIN}/${value}`;
};

export const handleImageError = (event) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") {
    return;
  }

  image.dataset.fallbackApplied = "true";
  image.src = FALLBACK_IMAGE_URL;
};

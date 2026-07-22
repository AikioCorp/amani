const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("127.0.0.1");

// Determine the API URL base. Uses VITE_API_URL if injected, otherwise falls back to environment check.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || (isLocal ? "http://localhost:5000/api" : "/api")).replace(/\/+$/, "");

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

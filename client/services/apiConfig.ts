const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
const isLocal =
  host === "localhost" ||
  host === "127.0.0.1" ||
  /^192\.168\.\d+\.\d+$/.test(host) ||
  /^172\.\d+\.\d+\.\d+$/.test(host) ||
  /^10\.\d+\.\d+\.\d+$/.test(host);

// Fallback dynamique : si exécuté sur localhost/IP locale -> http://${host}:5000/api
// Si exécuté sur Railway/Web -> utilise l'origine du site window.location.origin + "/api"
const fallbackApi = isLocal
  ? `http://${host}:5000/api`
  : typeof window !== "undefined" && window.location.origin
  ? `${window.location.origin}/api`
  : "http://localhost:5000/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || fallbackApi
).replace(/\/+$/, "");

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

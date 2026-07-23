const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
const isLocal =
  host === "localhost" ||
  host === "127.0.0.1" ||
  /^192\.168\.\d+\.\d+$/.test(host) ||
  /^172\.\d+\.\d+\.\d+$/.test(host) ||
  /^10\.\d+\.\d+\.\d+$/.test(host);

// URL de secours directe de l'API backend sur Railway
const RAILWAY_BACKEND_API = "https://amani-api-production.up.railway.app/api";

// URL de base dynamique : utilise VITE_API_URL, l'IP locale en dev, ou l'API Railway en production.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (isLocal ? `http://${host}:5000/api` : RAILWAY_BACKEND_API)
).replace(/\/+$/, "");

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

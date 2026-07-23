const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
const isLocal =
  host === "localhost" ||
  host === "127.0.0.1" ||
  /^192\.168\.\d+\.\d+$/.test(host) ||
  /^172\.\d+\.\d+\.\d+$/.test(host) ||
  /^10\.\d+\.\d+\.\d+$/.test(host);

// URL de base dynamique pour le réseau local, Railway et la production.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (isLocal
    ? `http://${host}:5000/api`
    : typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : "/api")
).replace(/\/+$/, "");

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

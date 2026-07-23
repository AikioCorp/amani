// Ultra-fast client-side Stale-While-Revalidate cache system for Amani Platform

const memoryCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const apiCache = {
  get<T = any>(key: string): T | null {
    // 1. Check RAM memory cache
    const cached = memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < DEFAULT_TTL_MS) {
      return cached.data as T;
    }

    // 2. Check SessionStorage
    try {
      const stored = sessionStorage.getItem(`amani_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < DEFAULT_TTL_MS) {
          memoryCache.set(key, parsed);
          return parsed.data as T;
        }
      }
    } catch {}

    return null;
  },

  set(key: string, data: any): void {
    const entry = { data, timestamp: Date.now() };
    memoryCache.set(key, entry);
    try {
      sessionStorage.setItem(`amani_cache_${key}`, JSON.stringify(entry));
    } catch {}
  },

  clear(): void {
    memoryCache.clear();
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith("amani_cache_")) {
          sessionStorage.removeItem(k);
        }
      });
    } catch {}
  },
};

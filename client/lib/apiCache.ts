// Ultra-fast client-side Stale-While-Revalidate cache system for Amani Platform

const memoryCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes TTL for instant paints

export const apiCache = {
  get<T = any>(key: string): T | null {
    // 1. Check RAM memory cache (0ms instant)
    const cached = memoryCache.get(key);
    if (cached) {
      return cached.data as T;
    }

    // 2. Check LocalStorage (0ms disk speed)
    try {
      const stored = localStorage.getItem(`amani_cache_v3_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.data) {
          memoryCache.set(key, parsed);
          return parsed.data as T;
        }
      }
    } catch (e) {
      console.warn("apiCache read error:", e);
    }

    return null;
  },

  set(key: string, data: any): void {
    if (data === undefined || data === null) return;
    const entry = { data, timestamp: Date.now() };
    memoryCache.set(key, entry);
    try {
      localStorage.setItem(`amani_cache_v3_${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn("apiCache write error:", e);
    }
  },

  clear(): void {
    memoryCache.clear();
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("amani_cache_")) {
          localStorage.removeItem(k);
        }
      });
    } catch {}
  },
};

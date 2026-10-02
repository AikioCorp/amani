/**
 * System-wide Back-Office Cache Layer (Memory + LocalStorage fallback)
 * Ultra-fast instant data delivery (< 1ms) for admin dashboards.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class AdminCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes TTL

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      // Fallback local storage check
      try {
        const stored = localStorage.getItem(`amani_admin_cache_${key}`);
        if (stored) {
          const parsed: CacheEntry<T> = JSON.parse(stored);
          if (Date.now() - parsed.timestamp < this.defaultTTL * 2) {
            this.cache.set(key, parsed);
            return parsed.data;
          }
        }
      } catch (e) {}
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    this.cache.set(key, entry);

    try {
      localStorage.setItem(`amani_admin_cache_${key}`, JSON.stringify(entry));
    } catch (e) {}
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`amani_admin_cache_${key}`);
    } catch (e) {}
  }

  clearAll(): void {
    this.cache.clear();
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("amani_admin_cache_"))
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
  }
}

export const adminCache = new AdminCacheService();

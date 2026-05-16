interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Map<string, CacheEntry<any>>();

export function cacheKey(date: string, section: string, ...parts: string[]): string {
  const filtered = parts.filter((p) => p.length > 0);
  return filtered.length > 0
    ? `${date}:${section}:${filtered.join(":")}`
    : `${date}:${section}`;
}

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

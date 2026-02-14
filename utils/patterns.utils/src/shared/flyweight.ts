/** Factory that caches instances by key (get, clear, size). */
export type FlyweightFactory<K, V> = {
  get: (key: K) => V;
  clear: () => void;
  size: () => number;
};

/**
 * Flyweight pattern: share instances by key; same key returns same instance.
 * @param keyToId - Maps key to cache id string
 * @param create - Creates a new instance for a key when not cached
 * @returns FlyweightFactory with get, clear, size
 */
export function createFlyweightFactory<K, V>(
  keyToId: (key: K) => string,
  create: (key: K) => V
): FlyweightFactory<K, V> {
  const cache = new Map<string, V>();

  return {
    get: (key) => {
      const id = keyToId(key);
      const cached = cache.get(id);
      if (cached) return cached;
      const value = create(key);
      cache.set(id, value);
      return value;
    },
    clear: () => {
      cache.clear();
    },
    size: () => cache.size,
  };
}

/**
 * Mock for react-native-mmkv in Jest (node environment).
 * Uses an in-memory Map to simulate MMKV behaviour.
 */

const store = new Map<string, string>();

export const createMMKV = (_config?: { id?: string }) => ({
  getString: (key: string) => store.get(key),
  set: (key: string, value: string) => store.set(key, value),
  remove: (key: string) => store.delete(key),
  contains: (key: string) => store.has(key),
  clearAll: () => store.clear(),
  getAllKeys: () => Array.from(store.keys()),
});

export type MMKV = ReturnType<typeof createMMKV>;

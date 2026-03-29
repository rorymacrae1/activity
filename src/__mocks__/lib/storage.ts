/**
 * Mock for src/lib/storage — replaces both storage.ts (web) and
 * storage.native.ts with a simple in-memory store for Jest.
 */
const store = new Map<string, string>();

export const zustandStorage = {
  getItem: (name: string) => store.get(name) ?? null,
  setItem: (name: string, value: string) => { store.set(name, value); },
  removeItem: (name: string) => { store.delete(name); },
  _clear: () => store.clear(),
};

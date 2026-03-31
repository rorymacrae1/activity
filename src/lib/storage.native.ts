import { createMMKV } from "react-native-mmkv";

/**
 * Native storage adapter for Zustand persist middleware.
 * Uses react-native-mmkv v4 — synchronous, fast, encrypted-capable.
 * Metro automatically selects this file on iOS/Android over storage.ts.
 */

export type StorageAdapter = {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => void | Promise<void>;
  removeItem: (name: string) => void | Promise<void>;
};

const mmkv = createMMKV({ id: "pistewise-store" });

export const zustandStorage: StorageAdapter = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => { mmkv.remove(name); },
};

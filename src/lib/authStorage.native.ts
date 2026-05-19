/**
 * Supabase auth storage adapter — Native version.
 * Uses expo-secure-store for encrypted token persistence
 * (iOS Keychain / Android Keystore).
 */

import * as SecureStore from "expo-secure-store";

export const supabaseAuthStorage = {
  getItem: (key: string): string | null => {
    return SecureStore.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    SecureStore.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },
};

/**
 * Supabase auth storage adapter — Web version.
 * Uses localStorage (the default Supabase behavior).
 */

export const supabaseAuthStorage = {
  getItem: (key: string): string | null => {
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
};

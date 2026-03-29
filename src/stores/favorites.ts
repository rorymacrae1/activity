import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "@lib/storage";

interface FavoritesState {
  // List of favorited resort IDs
  favoriteIds: string[];

  // Actions
  addFavorite: (resortId: string) => void;
  removeFavorite: (resortId: string) => void;
  isFavorite: (resortId: string) => boolean;
  clearAll: () => void;
}

/**
 * Zustand store for saved/favorite resorts.
 * Persisted to MMKV storage.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      addFavorite: (resortId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(resortId)
            ? state.favoriteIds
            : [...state.favoriteIds, resortId],
        })),

      removeFavorite: (resortId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== resortId),
        })),

      isFavorite: (resortId) => get().favoriteIds.includes(resortId),

      clearAll: () => set({ favoriteIds: [] }),
    }),
    {
      name: "peakwise-favorites",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

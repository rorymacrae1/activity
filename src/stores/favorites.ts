import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "@lib/storage";
import {
  fetchCloudFavorites,
  addCloudFavorite,
  removeCloudFavorite,
  mergeFavorites,
  syncAllFavoritesToCloud,
} from "@/services/sync";

interface FavoritesState {
  // List of favorited resort IDs
  favoriteIds: string[];

  // Sync state
  isSyncing: boolean;
  lastSyncedAt: string | null;
  _userId: string | null; // Track logged-in user for auto-sync

  // Actions
  addFavorite: (resortId: string) => void;
  removeFavorite: (resortId: string) => void;
  isFavorite: (resortId: string) => boolean;
  clearAll: () => void;

  // Cloud sync actions
  setUserId: (userId: string | null) => void;
  syncFromCloud: (userId: string) => Promise<void>;
  syncToCloud: (userId: string) => Promise<void>;
  mergeWithCloud: (userId: string) => Promise<void>;
}

/**
 * Zustand store for saved/favorite resorts.
 * Persisted to MMKV storage with optional cloud sync.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      isSyncing: false,
      lastSyncedAt: null,
      _userId: null,

      addFavorite: (resortId) => {
        const { _userId, favoriteIds } = get();
        if (favoriteIds.includes(resortId)) return;

        set({ favoriteIds: [...favoriteIds, resortId] });

        // Sync to cloud if logged in
        if (_userId) {
          addCloudFavorite(_userId, resortId).catch(console.warn);
        }
      },

      removeFavorite: (resortId) => {
        const { _userId } = get();
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== resortId),
        }));

        // Sync to cloud if logged in
        if (_userId) {
          removeCloudFavorite(_userId, resortId).catch(console.warn);
        }
      },

      isFavorite: (resortId) => get().favoriteIds.includes(resortId),

      clearAll: () => set({ favoriteIds: [] }),

      // ─────────────────────────────────────────────────────────────────────
      // Cloud Sync
      // ─────────────────────────────────────────────────────────────────────

      setUserId: (userId) => set({ _userId: userId }),

      syncFromCloud: async (userId) => {
        set({ isSyncing: true });
        try {
          const cloudFavorites = await fetchCloudFavorites(userId);
          if (cloudFavorites) {
            set({ favoriteIds: cloudFavorites });
          }
          set({ lastSyncedAt: new Date().toISOString() });
        } finally {
          set({ isSyncing: false });
        }
      },

      syncToCloud: async (userId) => {
        set({ isSyncing: true });
        try {
          const { favoriteIds } = get();
          await syncAllFavoritesToCloud(userId, favoriteIds);
          set({ lastSyncedAt: new Date().toISOString() });
        } finally {
          set({ isSyncing: false });
        }
      },

      mergeWithCloud: async (userId) => {
        set({ isSyncing: true });
        try {
          const { favoriteIds: localFavorites } = get();
          const cloudFavorites = await fetchCloudFavorites(userId);

          if (cloudFavorites) {
            // Merge: union of local and cloud
            const merged = mergeFavorites(localFavorites, cloudFavorites);
            set({ favoriteIds: merged });

            // Sync merged back to cloud
            await syncAllFavoritesToCloud(userId, merged);
          }

          set({ lastSyncedAt: new Date().toISOString(), _userId: userId });
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "peakwise-favorites",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        // Only persist favorites, not sync state
        favoriteIds: state.favoriteIds,
      }),
    },
  ),
);

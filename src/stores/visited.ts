import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "@lib/storage";
import { getVisitedResorts } from "@services/profile";

interface VisitedState {
  visitedIds: string[];
  isVisited: (id: string) => boolean;
  setVisited: (id: string, visited: boolean) => void;
  syncFromCloud: (userId: string) => Promise<void>;
}

/**
 * Local cache of resorts the user has marked as visited.
 * Persisted to MMKV so visited state survives app restarts.
 * Syncs from Supabase `visited_resorts` on request (e.g. profile screen sync).
 */
export const useVisitedStore = create<VisitedState>()(
  persist(
    (set, get) => ({
      visitedIds: [],

      isVisited: (id) => get().visitedIds.includes(id),

      setVisited: (id, visited) => {
        set((state) => ({
          visitedIds: visited
            ? state.visitedIds.includes(id)
              ? state.visitedIds
              : [...state.visitedIds, id]
            : state.visitedIds.filter((v) => v !== id),
        }));
      },

      syncFromCloud: async (userId) => {
        try {
          const visited = await getVisitedResorts(userId);
          set({ visitedIds: visited.map((v) => v.resort_id) });
        } catch {
          // Silently fail — local MMKV cache is good enough
        }
      },
    }),
    {
      name: "peakwise-visited",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ visitedIds: state.visitedIds }),
    },
  ),
);

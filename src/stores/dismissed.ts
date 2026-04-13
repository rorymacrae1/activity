import { create } from "zustand";

interface DismissedState {
  /** Resort IDs dismissed this session — not persisted across app restarts. */
  dismissedIds: string[];
  /** Dismiss a resort so it is excluded from future recommendation runs. */
  dismiss: (id: string) => void;
  /** Clear all dismissed IDs (e.g. when user starts a fresh recommendation run). */
  clearDismissed: () => void;
}

/**
 * Session-only store for resorts the user has marked as "Not for me".
 * Intentionally not persisted — dismissals reset on every app restart.
 */
export const useDismissedStore = create<DismissedState>((set) => ({
  dismissedIds: [],
  dismiss: (id) =>
    set((state) => ({
      dismissedIds: state.dismissedIds.includes(id)
        ? state.dismissedIds
        : [...state.dismissedIds, id],
    })),
  clearDismissed: () => set({ dismissedIds: [] }),
}));

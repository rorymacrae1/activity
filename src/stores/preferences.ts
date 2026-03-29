import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SkillLevel, BudgetLevel, Preferences } from "@/types/preferences";
import { zustandStorage } from "@lib/storage";

interface PreferencesState {
  // Quiz completion status
  hasCompletedOnboarding: boolean;

  // Preferences
  skillLevel: SkillLevel | null;
  budgetLevel: BudgetLevel | null;
  regions: string[];
  crowdPreference: number; // 1-5
  familyVsNightlife: number; // 1-5
  snowImportance: number; // 1-5

  // Actions
  setHasCompletedOnboarding: (completed: boolean) => void;
  setSkillLevel: (level: SkillLevel) => void;
  setBudgetLevel: (level: BudgetLevel) => void;
  setRegions: (regions: string[]) => void;
  setCrowdPreference: (value: number) => void;
  setFamilyVsNightlife: (value: number) => void;
  setSnowImportance: (value: number) => void;
  reset: () => void;
  getPreferencesInput: () => Preferences;
}

const initialState = {
  hasCompletedOnboarding: false,
  skillLevel: null as SkillLevel | null,
  budgetLevel: null as BudgetLevel | null,
  regions: [] as string[],
  crowdPreference: 3,
  familyVsNightlife: 3,
  snowImportance: 3,
};

/**
 * Zustand store for user preferences.
 * Persisted to MMKV storage.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasCompletedOnboarding: (completed) =>
        set({ hasCompletedOnboarding: completed }),

      setSkillLevel: (level) => set({ skillLevel: level }),

      setBudgetLevel: (level) => set({ budgetLevel: level }),

      setRegions: (regions) => set({ regions }),

      setCrowdPreference: (value) => set({ crowdPreference: value }),

      setFamilyVsNightlife: (value) => set({ familyVsNightlife: value }),

      setSnowImportance: (value) => set({ snowImportance: value }),

      reset: () => set(initialState),

      getPreferencesInput: (): Preferences => {
        const state = get();
        return {
          skillLevel: state.skillLevel ?? "intermediate",
          budgetLevel: state.budgetLevel ?? "mid",
          regions:
            state.regions.length > 0
              ? state.regions
              : ["france-alps", "austria", "switzerland"],
          crowdPreference: state.crowdPreference,
          familyVsNightlife: state.familyVsNightlife,
          snowImportance: state.snowImportance,
        };
      },
    }),
    {
      name: "peakwise-preferences",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

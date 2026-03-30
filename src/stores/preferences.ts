import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SkillLevel, BudgetLevel, Preferences, TripType } from "@/types/preferences";
import type { Language } from "@/content";
import { zustandStorage } from "@lib/storage";

interface PreferencesState {
  // Quiz completion status
  hasCompletedOnboarding: boolean;

  // Preferences
  tripType: TripType | null;
  groupAbilities: SkillLevel[];
  budgetLevel: BudgetLevel | null;
  regions: string[];
  crowdPreference: number; // 1-5
  familyVsNightlife: number; // 1-5
  snowImportance: number; // 1-5

  // Actions
  setHasCompletedOnboarding: (completed: boolean) => void;
  setTripType: (type: TripType) => void;
  setGroupAbilities: (abilities: SkillLevel[]) => void;
  setBudgetLevel: (level: BudgetLevel) => void;
  setRegions: (regions: string[]) => void;
  setCrowdPreference: (value: number) => void;
  setFamilyVsNightlife: (value: number) => void;
  setSnowImportance: (value: number) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  reset: () => void;
  getPreferencesInput: () => Preferences;
}

const initialState = {
  hasCompletedOnboarding: false,
  tripType: null as TripType | null,
  groupAbilities: [] as SkillLevel[],
  budgetLevel: null as BudgetLevel | null,
  regions: [] as string[],
  crowdPreference: 3,
  familyVsNightlife: 3,
  snowImportance: 3,
  language: "en" as Language,
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

      setTripType: (type) => set({ tripType: type }),

      setGroupAbilities: (abilities) => set({ groupAbilities: abilities }),

      setBudgetLevel: (level) => set({ budgetLevel: level }),

      setRegions: (regions) => set({ regions }),

      setCrowdPreference: (value) => set({ crowdPreference: value }),

      setFamilyVsNightlife: (value) => set({ familyVsNightlife: value }),

      setSnowImportance: (value) => set({ snowImportance: value }),

      setLanguage: (lang) => set({ language: lang }),

      reset: () => set(initialState),

      getPreferencesInput: (): Preferences => {
        const state = get();
        return {
          tripType: state.tripType,
          groupAbilities: state.groupAbilities.length > 0 ? state.groupAbilities : ["intermediate"],
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

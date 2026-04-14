import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  SkillLevel,
  BudgetLevel,
  Preferences,
  TripType,
} from "@/types/preferences";
import type { Language } from "@/content";
import { zustandStorage } from "@lib/storage";
import {
  fetchCloudPreferences,
  saveCloudPreferences,
  cloudToLocalPreferences,
  type LocalPreferences,
} from "@/services/sync";

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
  language: Language;

  // Sync state
  isSyncing: boolean;
  syncError: string | null;
  lastSyncedAt: string | null;

  // Actions
  setHasCompletedOnboarding: (completed: boolean) => void;
  setTripType: (type: TripType) => void;
  setGroupAbilities: (abilities: SkillLevel[]) => void;
  setBudgetLevel: (level: BudgetLevel) => void;
  setRegions: (regions: string[]) => void;
  setCrowdPreference: (value: number) => void;
  setFamilyVsNightlife: (value: number) => void;
  setSnowImportance: (value: number) => void;
  setLanguage: (lang: Language) => void;
  reset: () => void;
  getPreferencesInput: () => Preferences;

  // Cloud sync actions
  syncFromCloud: (userId: string) => Promise<void>;
  syncToCloud: (userId: string) => Promise<void>;
  getLocalPreferences: () => LocalPreferences;
  setFromCloud: (prefs: LocalPreferences) => void;
}

// Valid values for rehydration validation
const VALID_SKILL_LEVELS: ReadonlySet<string> = new Set([
  "beginner",
  "intermediate",
  "red",
  "advanced",
]);
const VALID_BUDGET_LEVELS: ReadonlySet<string> = new Set([
  "budget",
  "mid",
  "premium",
  "luxury",
]);
const VALID_TRIP_TYPES: ReadonlySet<string> = new Set([
  "solo",
  "couple",
  "family",
  "friends",
]);
const VALID_LANGUAGES: ReadonlySet<string> = new Set(["en", "de", "fr"]);

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
  isSyncing: false,
  syncError: null as string | null,
  lastSyncedAt: null as string | null,
};

/**
 * Zustand store for user preferences.
 * Persisted to MMKV storage with optional cloud sync.
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
          groupAbilities:
            state.groupAbilities.length > 0
              ? state.groupAbilities
              : ["intermediate"],
          budgetLevel: state.budgetLevel ?? "mid",
          regions:
            state.regions.length > 0
              ? state.regions
              : ["France", "Austria", "Switzerland"], // Default to major ski countries
          crowdPreference: state.crowdPreference,
          familyVsNightlife: state.familyVsNightlife,
          snowImportance: state.snowImportance,
        };
      },

      // ─────────────────────────────────────────────────────────────────────
      // Cloud Sync
      // ─────────────────────────────────────────────────────────────────────

      getLocalPreferences: (): LocalPreferences => {
        const state = get();
        return {
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          tripType: state.tripType,
          groupAbilities: state.groupAbilities,
          budgetLevel: state.budgetLevel,
          regions: state.regions,
          crowdPreference: state.crowdPreference,
          familyVsNightlife: state.familyVsNightlife,
          snowImportance: state.snowImportance,
          language: state.language,
        };
      },

      setFromCloud: (prefs) => {
        set({
          hasCompletedOnboarding: prefs.hasCompletedOnboarding,
          tripType: prefs.tripType,
          groupAbilities: prefs.groupAbilities,
          budgetLevel: prefs.budgetLevel,
          regions: prefs.regions,
          crowdPreference: prefs.crowdPreference,
          familyVsNightlife: prefs.familyVsNightlife,
          snowImportance: prefs.snowImportance,
          language: prefs.language as Language,
        });
      },

      syncFromCloud: async (userId) => {
        set({ isSyncing: true, syncError: null });
        try {
          const cloudPrefs = await fetchCloudPreferences(userId);
          if (cloudPrefs) {
            const local = cloudToLocalPreferences(cloudPrefs);
            // If cloud has completed onboarding, use cloud prefs
            if (cloudPrefs.has_completed_onboarding) {
              get().setFromCloud(local);
            }
          }
          set({ lastSyncedAt: new Date().toISOString() });
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : "Failed to sync preferences";
          set({ syncError: msg });
        } finally {
          set({ isSyncing: false });
        }
      },

      syncToCloud: async (userId) => {
        set({ isSyncing: true, syncError: null });
        try {
          const prefs = get().getLocalPreferences();
          await saveCloudPreferences(userId, prefs);
          set({ lastSyncedAt: new Date().toISOString() });
        } catch (e: unknown) {
          const msg =
            e instanceof Error ? e.message : "Failed to sync preferences";
          set({ syncError: msg });
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "peakwise-preferences",
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown>;
        // Strip invalid skill levels (e.g. stale "FirstTimer")
        if (Array.isArray(state.groupAbilities)) {
          state.groupAbilities = state.groupAbilities.filter((v: unknown) =>
            VALID_SKILL_LEVELS.has(v as string),
          );
        }
        // Validate budget level
        if (
          state.budgetLevel !== null &&
          !VALID_BUDGET_LEVELS.has(state.budgetLevel as string)
        ) {
          state.budgetLevel = null;
        }
        // Validate trip type
        if (
          state.tripType !== null &&
          !VALID_TRIP_TYPES.has(state.tripType as string)
        ) {
          state.tripType = null;
        }
        // Validate language
        if (!VALID_LANGUAGES.has(state.language as string)) {
          state.language = "en";
        }
        return state as unknown as PreferencesState;
      },
      partialize: (state) => ({
        // Only persist these fields (not sync state)
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        tripType: state.tripType,
        groupAbilities: state.groupAbilities,
        budgetLevel: state.budgetLevel,
        regions: state.regions,
        crowdPreference: state.crowdPreference,
        familyVsNightlife: state.familyVsNightlife,
        snowImportance: state.snowImportance,
        language: state.language,
      }),
    },
  ),
);

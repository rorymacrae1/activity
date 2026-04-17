import { act } from "react";
import { usePreferencesStore } from "@stores/preferences";
import type { SkillLevel } from "@/types/preferences";

const initialState = {
  hasCompletedOnboarding: false,
  tripType: null,
  groupAbilities: [] as SkillLevel[],
  budgetLevel: null,
  regions: [] as string[],
  crowdPreference: 3,
  familyVsNightlife: 3,
  snowImportance: 3,
};

beforeEach(() => {
  act(() => usePreferencesStore.setState(initialState));
});

describe("usePreferencesStore", () => {
  it("starts with default state", () => {
    const s = usePreferencesStore.getState();
    expect(s.hasCompletedOnboarding).toBe(false);
    expect(s.groupAbilities).toEqual([]);
    expect(s.budgetLevel).toBeNull();
    expect(s.regions).toHaveLength(0);
    expect(s.crowdPreference).toBe(3);
  });

  it("setGroupAbilities updates groupAbilities", () => {
    act(() =>
      usePreferencesStore.getState().setGroupAbilities(["intermediate"]),
    );
    expect(usePreferencesStore.getState().groupAbilities).toEqual([
      "intermediate",
    ]);
  });

  it("setBudgetLevel updates budgetLevel", () => {
    act(() => usePreferencesStore.getState().setBudgetLevel("luxury"));
    expect(usePreferencesStore.getState().budgetLevel).toBe("luxury");
  });

  it("setRegions updates regions array", () => {
    act(() =>
      usePreferencesStore.getState().setRegions(["france-alps", "austria"]),
    );
    expect(usePreferencesStore.getState().regions).toEqual([
      "france-alps",
      "austria",
    ]);
  });

  it("setCrowdPreference updates crowdPreference", () => {
    act(() => usePreferencesStore.getState().setCrowdPreference(5));
    expect(usePreferencesStore.getState().crowdPreference).toBe(5);
  });

  it("setFamilyVsNightlife updates familyVsNightlife", () => {
    act(() => usePreferencesStore.getState().setFamilyVsNightlife(1));
    expect(usePreferencesStore.getState().familyVsNightlife).toBe(1);
  });

  it("setSnowImportance updates snowImportance", () => {
    act(() => usePreferencesStore.getState().setSnowImportance(5));
    expect(usePreferencesStore.getState().snowImportance).toBe(5);
  });

  it("setHasCompletedOnboarding marks onboarding complete", () => {
    act(() => usePreferencesStore.getState().setHasCompletedOnboarding(true));
    expect(usePreferencesStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it("reset restores initial state", () => {
    act(() => {
      usePreferencesStore.getState().setGroupAbilities(["beginner"]);
      usePreferencesStore.getState().setBudgetLevel("budget");
      usePreferencesStore.getState().setHasCompletedOnboarding(true);
      usePreferencesStore.getState().reset();
    });
    const s = usePreferencesStore.getState();
    expect(s.groupAbilities).toEqual([]);
    expect(s.budgetLevel).toBeNull();
    expect(s.hasCompletedOnboarding).toBe(false);
  });

  describe("getPreferencesInput", () => {
    it("returns defaults when nothing is set", () => {
      const prefs = usePreferencesStore.getState().getPreferencesInput();
      expect(prefs.groupAbilities).toEqual(["intermediate"]);
      expect(prefs.budgetLevel).toBe("mid");
      expect(prefs.regions.length).toBeGreaterThan(0);
    });

    it("returns set values when preferences are populated", () => {
      act(() => {
        usePreferencesStore.getState().setGroupAbilities(["advanced"]);
        usePreferencesStore.getState().setBudgetLevel("luxury");
        usePreferencesStore.getState().setRegions(["switzerland"]);
      });
      const prefs = usePreferencesStore.getState().getPreferencesInput();
      expect(prefs.groupAbilities).toEqual(["advanced"]);
      expect(prefs.budgetLevel).toBe("luxury");
      expect(prefs.regions).toEqual(["switzerland"]);
    });
  });
});

import { calculateScores } from "../scorer";
import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";

const makeResort = (
  overrides: Partial<Resort["attributes"] & Resort["terrain"] & { season: Resort["season"] }> = {},
): Resort => ({
  id: "test-resort",
  name: "Test Resort",
  country: "France",
  region: "Alps",
  continent: "Europe",
  location: { lat: 0, lng: 0, villageAltitude: 1500, peakAltitude: 3000 },
  terrain: {
    beginner: overrides.beginner ?? 25,
    intermediate: overrides.intermediate ?? 50,
    advanced: overrides.advanced ?? 25,
  },
  stats: { totalRuns: 100, totalKm: 200, lifts: 30, snowParks: 2 },
  attributes: {
    averageDailyCost: overrides.averageDailyCost ?? 150,
    liftPassDayCost: 60,
    liftPassSixDayCost: 290,
    crowdLevel: overrides.crowdLevel ?? 3,
    familyScore: overrides.familyScore ?? 3,
    nightlifeScore: overrides.nightlifeScore ?? 3,
    snowReliability: overrides.snowReliability ?? 4,
    liftModernity: 4,
    nearestAirport: "Geneva (GVA)",
    transferTimeMinutes: 120,
    townStyle: "Traditional village",
    barCount: 20,
    otherActivities: ["Ice skating", "Snowshoeing"],
  },
  content: { description: "A test resort.", highlights: [] },
  assets: { heroImage: "", pisteMap: "" },
  season: overrides.season ?? { start: "2025-12-01", end: "2027-04-20" },
});

const basePrefs: NormalizedPreferences = {
  minSkill: 0.5,
  maxSkill: 0.5,
  tripType: null,
  budgetLevel: 0.33,
  quietLively: 0.5,
  familyNightlife: 0.5,
  preferredMonths: [12, 1, 2, 3],
  regions: ["france-alps"],
  featurePreferences: [],
};

describe("calculateScores", () => {
  describe("skill score", () => {
    it("scores 100 for perfect intermediate terrain", () => {
      const resort = makeResort({
        beginner: 20,
        intermediate: 55,
        advanced: 25,
      });
      const scores = calculateScores(resort, {
        ...basePrefs,
        minSkill: 0.5,
        maxSkill: 0.5,
      });
      expect(scores.skill).toBe(100);
    });

    it("scores 100 for perfect beginner terrain", () => {
      const resort = makeResort({
        beginner: 50,
        intermediate: 40,
        advanced: 10,
      });
      const scores = calculateScores(resort, {
        ...basePrefs,
        minSkill: 0,
        maxSkill: 0,
      });
      expect(scores.skill).toBe(100);
    });

    it("scores 100 for perfect advanced terrain", () => {
      const resort = makeResort({
        beginner: 5,
        intermediate: 25,
        advanced: 70,
      });
      const scores = calculateScores(resort, {
        ...basePrefs,
        minSkill: 1,
        maxSkill: 1,
      });
      expect(scores.skill).toBe(100);
    });

    it("penalises beginner-heavy resort for advanced skier", () => {
      const resort = makeResort({
        beginner: 70,
        intermediate: 20,
        advanced: 10,
      });
      const scores = calculateScores(resort, {
        ...basePrefs,
        minSkill: 1,
        maxSkill: 1,
      });
      expect(scores.skill).toBeLessThan(70);
    });

    it("differentiates red runner from expert skier", () => {
      // Red runner (0.67) prefers {10, 35, 55}; expert (1.0) prefers {5, 25, 70}
      const resort = makeResort({
        beginner: 10,
        intermediate: 35,
        advanced: 55,
      });
      const redScores = calculateScores(resort, {
        ...basePrefs,
        minSkill: 0.67,
        maxSkill: 0.67,
      });
      const expertScores = calculateScores(resort, {
        ...basePrefs,
        minSkill: 1,
        maxSkill: 1,
      });
      expect(redScores.skill).toBeGreaterThan(expertScores.skill);
    });

    it("returns a number between 0 and 100", () => {
      const resort = makeResort();
      const scores = calculateScores(resort, basePrefs);
      expect(scores.skill).toBeGreaterThanOrEqual(0);
      expect(scores.skill).toBeLessThanOrEqual(100);
    });
  });

  describe("budget score", () => {
    it("scores highly when resort cost matches budget range", () => {
      // mid budget (0.33) → range €100-180, ideal €140
      const resort = makeResort({ averageDailyCost: 140 });
      const scores = calculateScores(resort, {
        ...basePrefs,
        budgetLevel: 0.33,
      });
      expect(scores.budget).toBeGreaterThanOrEqual(90);
    });

    it("gives partial credit when resort is under budget", () => {
      const resort = makeResort({ averageDailyCost: 80 }); // Under mid range
      const scores = calculateScores(resort, {
        ...basePrefs,
        budgetLevel: 0.33,
      });
      expect(scores.budget).toBe(75);
    });

    it("penalises resort significantly over budget", () => {
      const resort = makeResort({ averageDailyCost: 400 }); // Way over budget range
      const scores = calculateScores(resort, { ...basePrefs, budgetLevel: 0 });
      expect(scores.budget).toBeLessThan(50);
    });

    it("returns a number between 0 and 100", () => {
      const resort = makeResort();
      const scores = calculateScores(resort, basePrefs);
      expect(scores.budget).toBeGreaterThanOrEqual(0);
      expect(scores.budget).toBeLessThanOrEqual(100);
    });
  });

  describe("vibe score", () => {
    it("scores 100 for quiet preference with quiet resort", () => {
      const resort = makeResort({ crowdLevel: 1 });
      const scores = calculateScores(resort, { ...basePrefs, quietLively: 0 });
      expect(scores.vibe).toBe(100);
    });

    it("scores 100 for lively preference with lively resort", () => {
      const resort = makeResort({ crowdLevel: 5 });
      const scores = calculateScores(resort, { ...basePrefs, quietLively: 1 });
      expect(scores.vibe).toBe(100);
    });

    it("penalises mismatch between quiet preference and lively resort", () => {
      const resort = makeResort({ crowdLevel: 5 });
      const scores = calculateScores(resort, { ...basePrefs, quietLively: 0 });
      expect(scores.vibe).toBe(0);
    });
  });

  describe("activity score", () => {
    it("scores highly for family preference with family resort", () => {
      const resort = makeResort({ familyScore: 5, nightlifeScore: 1 });
      const scores = calculateScores(resort, {
        ...basePrefs,
        familyNightlife: 0,
      });
      expect(scores.activity).toBe(100);
    });

    it("scores highly for nightlife preference with nightlife resort", () => {
      const resort = makeResort({ familyScore: 1, nightlifeScore: 5 });
      const scores = calculateScores(resort, {
        ...basePrefs,
        familyNightlife: 1,
      });
      expect(scores.activity).toBe(100);
    });
  });

  describe("season score", () => {
    it("scores 100 when resort is open all preferred months", () => {
      const resort = makeResort({ season: { start: "2024-11-01", end: "2025-04-30" } });
      const prefs = { ...basePrefs, preferredMonths: [12, 1, 2, 3] };
      const scores = calculateScores(resort, prefs);
      expect(scores.season).toBe(100);
    });

    it("scores higher with more overlap months", () => {
      const resort = makeResort({ season: { start: "2024-12-15", end: "2025-03-15" } });
      const prefs1 = { ...basePrefs, preferredMonths: [12, 1, 2, 3, 4, 5] };
      const prefs2 = { ...basePrefs, preferredMonths: [12, 1, 2, 3] };
      const scores1 = calculateScores(resort, prefs1);
      const scores2 = calculateScores(resort, prefs2);
      expect(scores2.season).toBeGreaterThanOrEqual(scores1.season);
    });
  });
});

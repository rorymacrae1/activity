import { calculateScores } from "../scorer";
import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";

const makeResort = (overrides: Partial<Resort["attributes"] & Resort["terrain"]> = {}): Resort => ({
  id: "test-resort",
  name: "Test Resort",
  country: "France",
  region: "Alps",
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
  season: { start: "2025-12-01", end: "2026-04-20" },
});

const basePrefs: NormalizedPreferences = {
  skillLevel: 0.5,
  budgetLevel: 0.33,
  quietLively: 0.5,
  familyNightlife: 0.5,
  snowImportance: 0.5,
  regions: ["france-alps"],
};

describe("calculateScores", () => {
  describe("skill score", () => {
    it("scores 100 for perfect intermediate terrain", () => {
      const resort = makeResort({ beginner: 20, intermediate: 55, advanced: 25 });
      const scores = calculateScores(resort, { ...basePrefs, skillLevel: 0.5 });
      expect(scores.skill).toBe(100);
    });

    it("scores 100 for perfect beginner terrain", () => {
      const resort = makeResort({ beginner: 50, intermediate: 40, advanced: 10 });
      const scores = calculateScores(resort, { ...basePrefs, skillLevel: 0 });
      expect(scores.skill).toBe(100);
    });

    it("scores 100 for perfect advanced terrain", () => {
      const resort = makeResort({ beginner: 10, intermediate: 30, advanced: 60 });
      const scores = calculateScores(resort, { ...basePrefs, skillLevel: 1 });
      expect(scores.skill).toBe(100);
    });

    it("penalises beginner-heavy resort for advanced skier", () => {
      const resort = makeResort({ beginner: 70, intermediate: 20, advanced: 10 });
      const scores = calculateScores(resort, { ...basePrefs, skillLevel: 1 });
      expect(scores.skill).toBeLessThan(70);
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
      const scores = calculateScores(resort, { ...basePrefs, budgetLevel: 0.33 });
      expect(scores.budget).toBeGreaterThanOrEqual(90);
    });

    it("gives partial credit when resort is under budget", () => {
      const resort = makeResort({ averageDailyCost: 80 }); // Under mid range
      const scores = calculateScores(resort, { ...basePrefs, budgetLevel: 0.33 });
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
      const scores = calculateScores(resort, { ...basePrefs, familyNightlife: 0 });
      expect(scores.activity).toBe(100);
    });

    it("scores highly for nightlife preference with nightlife resort", () => {
      const resort = makeResort({ familyScore: 1, nightlifeScore: 5 });
      const scores = calculateScores(resort, { ...basePrefs, familyNightlife: 1 });
      expect(scores.activity).toBe(100);
    });
  });

  describe("snow score", () => {
    it("scores 100 for max snow reliability", () => {
      const resort = makeResort({ snowReliability: 5 });
      const scores = calculateScores(resort, basePrefs);
      expect(scores.snow).toBe(100);
    });

    it("scales linearly with snow reliability", () => {
      const resort1 = makeResort({ snowReliability: 2 });
      const resort5 = makeResort({ snowReliability: 4 });
      const scores1 = calculateScores(resort1, basePrefs);
      const scores5 = calculateScores(resort5, basePrefs);
      expect(scores5.snow).toBeGreaterThan(scores1.snow);
    });
  });
});

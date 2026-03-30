import { generateExplanations } from "../explainer";
import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";
import type { AttributeScores } from "@/types/recommendation";

const makeResort = (attrs: Partial<Resort["attributes"]> = {}): Resort => ({
  id: "test-resort",
  name: "Test Resort",
  country: "France",
  region: "Alps",
  location: { lat: 0, lng: 0, villageAltitude: 1500, peakAltitude: 3000 },
  terrain: { beginner: 25, intermediate: 50, advanced: 25 },
  stats: { totalRuns: 100, totalKm: 200, lifts: 30, snowParks: 2 },
  attributes: {
    averageDailyCost: attrs.averageDailyCost ?? 150,
    liftPassDayCost: 60,
    liftPassSixDayCost: 290,
    crowdLevel: attrs.crowdLevel ?? 3,
    familyScore: attrs.familyScore ?? 3,
    nightlifeScore: attrs.nightlifeScore ?? 3,
    snowReliability: attrs.snowReliability ?? 4,
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
  minSkill: 0.5,
  maxSkill: 0.5,
  tripType: null,
  budgetLevel: 0.33,
  quietLively: 0.5,
  familyNightlife: 0.5,
  snowImportance: 0.5,
  regions: [],
};

describe("generateExplanations", () => {
  it("returns at least one reason", () => {
    const scores: AttributeScores = {
      skill: 30,
      budget: 30,
      vibe: 30,
      activity: 30,
      snow: 30,
    };
    const reasons = generateExplanations(makeResort(), scores, basePrefs);
    expect(reasons.length).toBeGreaterThanOrEqual(1);
  });

  it("returns a max of 3 reasons", () => {
    const scores: AttributeScores = {
      skill: 95,
      budget: 90,
      vibe: 88,
      activity: 85,
      snow: 82,
    };
    const reasons = generateExplanations(makeResort(), scores, basePrefs);
    expect(reasons.length).toBeLessThanOrEqual(3);
  });

  it("includes excellent budget reason when score >= 80", () => {
    const resort = makeResort({ averageDailyCost: 140 });
    const scores: AttributeScores = {
      skill: 50,
      budget: 95,
      vibe: 50,
      activity: 50,
      snow: 50,
    };
    const reasons = generateExplanations(resort, scores, basePrefs);
    expect(reasons.some((r) => r.includes("€140"))).toBe(true);
  });

  it("returns fallback reason when all scores are low", () => {
    const scores: AttributeScores = {
      skill: 10,
      budget: 10,
      vibe: 10,
      activity: 10,
      snow: 10,
    };
    const reasons = generateExplanations(makeResort(), scores, basePrefs);
    expect(reasons).toContain("Matches your overall preferences");
  });

  it("mentions peaceful when crowd level is low and score is high", () => {
    const resort = makeResort({ crowdLevel: 1 });
    const scores: AttributeScores = {
      skill: 50,
      budget: 50,
      vibe: 100,
      activity: 50,
      snow: 50,
    };
    const reasons = generateExplanations(resort, scores, basePrefs);
    expect(reasons.some((r) => r.toLowerCase().includes("peaceful"))).toBe(true);
  });

  it("mentions snow reliability when snow score is high", () => {
    const resort = makeResort({ snowReliability: 5 });
    const scores: AttributeScores = {
      skill: 50,
      budget: 50,
      vibe: 50,
      activity: 50,
      snow: 100,
    };
    const reasons = generateExplanations(resort, scores, basePrefs);
    expect(reasons.some((r) => r.includes("5/5"))).toBe(true);
  });
});

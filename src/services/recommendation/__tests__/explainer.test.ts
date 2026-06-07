import { generateExplanations } from "../explainer";
import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";
import type { AttributeScores } from "@/types/recommendation";

const makeResort = (attrs: Partial<Resort["attributes"]> & { season?: Resort["season"] } = {}): Resort => ({
  id: "test-resort",
  name: "Test Resort",
  country: "France",
  region: "Alps",
  continent: "Europe",
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
  season: attrs.season ?? { start: "2025-12-01", end: "2027-04-20" },
});

const basePrefs: NormalizedPreferences = {
  minSkill: 0.5,
  maxSkill: 0.5,
  tripType: null,
  budgetLevel: 0.33,
  quietLively: 0.5,
  familyNightlife: 0.5,
  preferredMonths: [12, 1, 2, 3],
  regions: [],
  featurePreferences: [],
};

describe("generateExplanations", () => {
  it("returns at least one reason", () => {
    const scores: AttributeScores = {
      skill: 30,
      budget: 30,
      vibe: 30,
      activity: 30,
      season: 30,
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
      season: 82,
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
      season: 50,
    };
    const reasons = generateExplanations(resort, scores, basePrefs);
    expect(reasons.some((r) => r.includes("£140"))).toBe(true);
  });

  it("returns fallback reason when all scores are low", () => {
    const scores: AttributeScores = {
      skill: 10,
      budget: 10,
      vibe: 10,
      activity: 10,
      season: 10,
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
      season: 50,
    };
    const reasons = generateExplanations(resort, scores, basePrefs);
    expect(reasons.some((r) => r.toLowerCase().includes("quiet"))).toBe(true);
  });

  it("mentions season when season score is high", () => {
    const resort = makeResort({ season: { start: "2024-11-01", end: "2025-04-30" } });
    const scores: AttributeScores = {
      skill: 50,
      budget: 50,
      vibe: 50,
      activity: 50,
      season: 100,
    };
    const reasons = generateExplanations(resort, scores, basePrefs);
    expect(reasons.some((r) => r.toLowerCase().includes("open") || r.toLowerCase().includes("season"))).toBe(true);
  });

  it("adds seasonal warning when resort is closing soon", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 5);
    const resort = makeResort();
    resort.season.end = soon.toISOString().slice(0, 10);
    const scores: AttributeScores = {
      skill: 90,
      budget: 90,
      vibe: 90,
      activity: 90,
      season: 90,
    };
    const reasons = generateExplanations(resort, scores, basePrefs);
    expect(
      reasons.some((r) => r.includes("Closing") || r.includes("book soon")),
    ).toBe(true);
  });

  it("adds season ended message for closed resorts", () => {
    const resort = makeResort();
    resort.season.end = "2025-03-01";
    const scores: AttributeScores = {
      skill: 90,
      budget: 90,
      vibe: 90,
      activity: 90,
      season: 90,
    };
    const reasons = generateExplanations(resort, scores, basePrefs);
    expect(reasons.some((r) => r.includes("ended"))).toBe(true);
  });

  it("does not add seasonal message when resort is fully open", () => {
    const scores: AttributeScores = {
      skill: 90,
      budget: 90,
      vibe: 90,
      activity: 90,
      season: 90,
    };
    const reasons = generateExplanations(makeResort(), scores, basePrefs);
    expect(
      reasons.every(
        (r) =>
          !r.includes("Closing") &&
          !r.includes("ended") &&
          !r.includes("Season ends"),
      ),
    ).toBe(true);
  });
});

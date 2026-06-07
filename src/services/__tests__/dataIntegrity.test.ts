/**
 * Data Integrity Tests
 *
 * Verifies the complete data pipeline from database row shape
 * through transformation to the Resort type that UI consumes.
 * Ensures no data is lost, mistyped, or silently defaulted.
 */

import {
  getAllResortsAsync,
  getResortByIdAsync,
  getResortsByRegionAsync,
  getResortCountsByCountry,
  clearResortCache,
} from "../resort";
import { MOCK_RESORT_DATA } from "@/__mocks__/lib/supabase";
import type { Resort } from "@/types/resort";

beforeEach(() => {
  clearResortCache();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Row → Resort transformation fidelity
// ─────────────────────────────────────────────────────────────────────────────

describe("supabaseRowToResort transformation", () => {
  it("preserves all scalar fields from the database row", async () => {
    const resort = await getResortByIdAsync("val-thorens");
    const sourceRow = MOCK_RESORT_DATA.find((r) => r.id === "val-thorens")!;

    expect(resort).toBeDefined();
    expect(resort!.id).toBe(sourceRow.id);
    expect(resort!.name).toBe(sourceRow.name);
    expect(resort!.country).toBe(sourceRow.country);
    expect(resort!.region).toBe(sourceRow.region);
  });

  it("correctly maps flat location columns", async () => {
    const resort = await getResortByIdAsync("val-thorens");
    const sourceRow = MOCK_RESORT_DATA.find((r) => r.id === "val-thorens")!;

    expect(resort!.location.lat).toBe(sourceRow.lat);
    expect(resort!.location.lng).toBe(sourceRow.lng);
    expect(resort!.location.villageAltitude).toBe(sourceRow.min_altitude_m);
    expect(resort!.location.peakAltitude).toBe(sourceRow.max_altitude_m);
  });

  it("correctly maps terrain percentages from run counts", async () => {
    const resort = await getResortByIdAsync("chamonix");
    const sourceRow = MOCK_RESORT_DATA.find((r) => r.id === "chamonix")!;

    const total = sourceRow.blue_runs + sourceRow.red_runs + sourceRow.black_runs;
    const expectedBeginner = Math.round((sourceRow.blue_runs / total) * 100);
    const expectedIntermediate = Math.round((sourceRow.red_runs / total) * 100);
    const expectedAdvanced = 100 - expectedBeginner - expectedIntermediate;

    expect(resort!.terrain.beginner).toBe(expectedBeginner);
    expect(resort!.terrain.intermediate).toBe(expectedIntermediate);
    expect(resort!.terrain.advanced).toBe(expectedAdvanced);
  });

  it("correctly maps stats from flat columns", async () => {
    const resort = await getResortByIdAsync("st-anton");
    const sourceRow = MOCK_RESORT_DATA.find((r) => r.id === "st-anton")!;

    expect(resort!.stats.totalRuns).toBe(
      sourceRow.blue_runs + sourceRow.red_runs + sourceRow.black_runs,
    );
    expect(resort!.stats.totalKm).toBe(sourceRow.total_km_piste);
    expect(resort!.stats.snowParks).toBe(sourceRow.snow_park ? 1 : 0);
  });

  it("correctly maps attributes from flat columns", async () => {
    const resort = await getResortByIdAsync("verbier");
    const sourceRow = MOCK_RESORT_DATA.find((r) => r.id === "verbier")!;

    expect(resort!.attributes.nightlifeScore).toBe(sourceRow.apres_ski_rating);
    expect(resort!.attributes.snowReliability).toBe(sourceRow.snow_sure_rating);
    expect(resort!.attributes.trainAccessible).toBe(sourceRow.train_accessible);
    expect(resort!.attributes.eurostarDirect).toBe(sourceRow.eurostar_direct);
    expect(resort!.attributes.trainJourneyHours).toBe(sourceRow.train_journey_hours);
    expect(resort!.attributes.driveHoursFromLondon).toBe(sourceRow.drive_hours_from_london);
  });

  it("correctly maps boolean transport attributes", async () => {
    const resort = await getResortByIdAsync("cortina");
    const sourceRow = MOCK_RESORT_DATA.find((r) => r.id === "cortina")!;

    expect(resort!.attributes.trainAccessible).toBe(sourceRow.train_accessible);
    expect(resort!.attributes.eurostarDirect).toBe(sourceRow.eurostar_direct);
    expect(resort!.attributes.trainJourneyHours).toBe(sourceRow.train_journey_hours);
  });

  it("generates a content description", async () => {
    const resort = await getResortByIdAsync("chamonix");

    expect(resort!.content.description).toBeTruthy();
    expect(resort!.content.description.length).toBeGreaterThan(0);
  });

  it("provides default season dates", async () => {
    const resort = await getResortByIdAsync("st-anton");

    expect(resort!.season.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(resort!.season.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses hero_image from row when present", async () => {
    const resort = await getResortByIdAsync("val-thorens");
    const sourceRow = MOCK_RESORT_DATA.find((r) => r.id === "val-thorens")!;

    // hero_image is set on val-thorens row
    expect(resort!.assets.heroImage).toBe(sourceRow.hero_image);
  });

  it("derives continent from country", async () => {
    const resorts = await getAllResortsAsync();
    const france = resorts.find((r) => r.country === "France");
    const austria = resorts.find((r) => r.country === "Austria");
    const switzerland = resorts.find((r) => r.country === "Switzerland");
    const italy = resorts.find((r) => r.country === "Italy");
    const andorra = resorts.find((r) => r.country === "Andorra");

    expect(france!.continent).toBe("Europe");
    expect(austria!.continent).toBe("Europe");
    expect(switzerland!.continent).toBe("Europe");
    expect(italy!.continent).toBe("Europe");
    expect(andorra!.continent).toBe("Europe");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Data completeness — every resort has ALL required fields
// ─────────────────────────────────────────────────────────────────────────────

describe("data completeness", () => {
  let resorts: Resort[];

  beforeAll(async () => {
    clearResortCache();
    resorts = await getAllResortsAsync();
  });

  it("returns the full set of resorts from the database", () => {
    expect(resorts).toHaveLength(MOCK_RESORT_DATA.length);
  });

  it("every resort has a non-empty id", () => {
    resorts.forEach((r) => {
      expect(r.id).toBeTruthy();
      expect(typeof r.id).toBe("string");
      expect(r.id.length).toBeGreaterThan(0);
    });
  });

  it("every resort has a non-empty name", () => {
    resorts.forEach((r) => {
      expect(r.name).toBeTruthy();
      expect(r.name.length).toBeGreaterThan(0);
    });
  });

  it("every resort has a non-empty country", () => {
    resorts.forEach((r) => {
      expect(r.country).toBeTruthy();
      expect(r.country.length).toBeGreaterThan(0);
    });
  });

  it("every resort has valid coordinates", () => {
    resorts.forEach((r) => {
      expect(r.location.lat).toBeGreaterThanOrEqual(-90);
      expect(r.location.lat).toBeLessThanOrEqual(90);
      expect(r.location.lng).toBeGreaterThanOrEqual(-180);
      expect(r.location.lng).toBeLessThanOrEqual(180);
    });
  });

  it("every resort has positive altitude values", () => {
    resorts.forEach((r) => {
      expect(r.location.villageAltitude).toBeGreaterThan(0);
      expect(r.location.peakAltitude).toBeGreaterThan(0);
      expect(r.location.peakAltitude).toBeGreaterThanOrEqual(
        r.location.villageAltitude,
      );
    });
  });

  it("every resort has terrain percentages summing to ~100", () => {
    resorts.forEach((r) => {
      const sum = r.terrain.beginner + r.terrain.intermediate + r.terrain.advanced;
      expect(sum).toBeGreaterThanOrEqual(99);
      expect(sum).toBeLessThanOrEqual(101);
    });
  });

  it("every resort has non-negative stats", () => {
    resorts.forEach((r) => {
      expect(r.stats.totalRuns).toBeGreaterThanOrEqual(0);
      expect(r.stats.totalKm).toBeGreaterThanOrEqual(0);
      expect(r.stats.lifts).toBeGreaterThanOrEqual(0);
      expect(r.stats.snowParks).toBeGreaterThanOrEqual(0);
    });
  });

  it("every resort has valid cost values", () => {
    resorts.forEach((r) => {
      expect(r.attributes.averageDailyCost).toBeGreaterThan(0);
      expect(r.attributes.liftPassDayCost).toBeGreaterThan(0);
      expect(r.attributes.liftPassSixDayCost).toBeGreaterThan(0);
      // Six-day pass should be less than 6x the day pass (volume discount)
      expect(r.attributes.liftPassSixDayCost).toBeLessThanOrEqual(
        r.attributes.liftPassDayCost * 6,
      );
    });
  });

  it("every resort has score attributes in 1-5 range", () => {
    resorts.forEach((r) => {
      const scoreFields = [
        r.attributes.crowdLevel,
        r.attributes.familyScore,
        r.attributes.nightlifeScore,
        r.attributes.snowReliability,
        r.attributes.liftModernity,
      ];
      scoreFields.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(5);
      });
    });
  });

  it("every resort has a valid townStyle", () => {
    const validStyles = [
      "Traditional village",
      "Purpose-built",
      "Lively town",
      "Small hamlet",
      "Modern resort",
    ];
    resorts.forEach((r) => {
      expect(validStyles).toContain(r.attributes.townStyle);
    });
  });

  it("every resort has valid season dates", () => {
    resorts.forEach((r) => {
      expect(r.season.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.season.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Season end should be after start
      expect(new Date(r.season.end).getTime()).toBeGreaterThan(
        new Date(r.season.start).getTime(),
      );
    });
  });

  it("every resort has a valid continent", () => {
    const validContinents = [
      "Europe",
      "North America",
      "South America",
      "Asia",
      "Oceania",
    ];
    resorts.forEach((r) => {
      expect(validContinents).toContain(r.continent);
    });
  });

  it("no duplicate resort IDs", () => {
    const ids = resorts.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Country filtering — data is correctly grouped
// ─────────────────────────────────────────────────────────────────────────────

describe("country filtering correctness", () => {
  beforeEach(() => {
    clearResortCache();
  });

  it("getResortCountsByCountry returns correct counts per country", async () => {
    const counts = await getResortCountsByCountry();

    // Verify against mock data
    const expectedCounts: Record<string, number> = {};
    MOCK_RESORT_DATA.forEach((row) => {
      expectedCounts[row.country] = (expectedCounts[row.country] || 0) + 1;
    });

    Object.entries(expectedCounts).forEach(([country, count]) => {
      expect(counts[country]).toBe(count);
    });
  });

  it("getResortCountsByCountry includes all countries from the dataset", async () => {
    const counts = await getResortCountsByCountry();
    const countriesInData = [...new Set(MOCK_RESORT_DATA.map((r) => r.country))];

    countriesInData.forEach((country) => {
      expect(counts).toHaveProperty(country);
      expect(counts[country]).toBeGreaterThan(0);
    });
  });

  it("region filter returns only matching countries", async () => {
    const french = await getResortsByRegionAsync(["France"]);
    expect(french.length).toBeGreaterThan(0);
    french.forEach((r) => expect(r.country).toBe("France"));

    const nonFrench = await getResortsByRegionAsync(["Austria", "Switzerland"]);
    nonFrench.forEach((r) => expect(r.country).not.toBe("France"));
  });

  it("region ID 'france-alps' maps to France resorts", async () => {
    const fromRegionId = await getResortsByRegionAsync(["france-alps"]);
    const fromCountry = await getResortsByRegionAsync(["France"]);
    expect(fromRegionId).toEqual(fromCountry);
  });

  it("no resorts are lost during filtering (union equals total)", async () => {
    const all = await getResortsByRegionAsync([]);
    const countries = [...new Set(all.map((r) => r.country))];

    let totalFiltered = 0;
    for (const country of countries) {
      const filtered = await getResortsByRegionAsync([country]);
      totalFiltered += filtered.length;
      clearResortCache();
    }

    expect(totalFiltered).toBe(all.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Data is correct through the recommendation pipeline
// ─────────────────────────────────────────────────────────────────────────────

describe("recommendation pipeline data integrity", () => {
  // Import here to ensure mock is properly set up
  const { getRecommendations } = require("../recommendation");

  const makePrefs = (overrides = {}) => ({
    tripType: "solo",
    groupAbilities: ["intermediate"],
    budgetLevel: "mid",
    regions: [],
    crowdPreference: 3,
    familyVsNightlife: 3,
    preferredMonths: [12, 1, 2, 3],
    ...overrides,
  });

  beforeEach(() => {
    clearResortCache();
  });

  it("recommendation results contain valid resort objects", async () => {
    const results = await getRecommendations(makePrefs(), 5);
    expect(results.length).toBeGreaterThan(0);

    results.forEach((result: { resort: Resort; matchScore: number; matchReasons: string[]; attributeScores: Record<string, number> }) => {
      // Resort data must be complete
      expect(result.resort.id).toBeTruthy();
      expect(result.resort.name).toBeTruthy();
      expect(result.resort.country).toBeTruthy();
      expect(result.resort.terrain.beginner).toBeGreaterThanOrEqual(0);
      expect(result.resort.attributes.averageDailyCost).toBeGreaterThan(0);
    });
  });

  it("recommendation scores are valid numbers 0-100", async () => {
    const results = await getRecommendations(
      makePrefs({ tripType: "family", groupAbilities: ["beginner", "intermediate"], budgetLevel: "budget" }),
      6,
    );
    results.forEach((result: { matchScore: number }) => {
      expect(result.matchScore).toBeGreaterThanOrEqual(0);
      expect(result.matchScore).toBeLessThanOrEqual(100);
      expect(Number.isInteger(result.matchScore)).toBe(true);
    });
  });

  it("results are sorted by matchScore descending", async () => {
    const results = await getRecommendations(
      makePrefs({ groupAbilities: ["advanced"], budgetLevel: "premium" }),
      6,
    );
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].matchScore).toBeGreaterThanOrEqual(
        results[i].matchScore,
      );
    }
  });

  it("each result has match reasons explaining the score", async () => {
    const results = await getRecommendations(
      makePrefs({ groupAbilities: ["red"], budgetLevel: "mid" }),
      3,
    );
    results.forEach((result: { matchReasons: string[] }) => {
      expect(result.matchReasons).toBeInstanceOf(Array);
      expect(result.matchReasons.length).toBeGreaterThan(0);
      result.matchReasons.forEach((reason: string) => {
        expect(typeof reason).toBe("string");
        expect(reason.length).toBeGreaterThan(0);
      });
    });
  });

  it("each result has all attribute scores", async () => {
    const results = await getRecommendations(makePrefs(), 3);
    results.forEach((result: { attributeScores: Record<string, number> }) => {
      expect(result.attributeScores).toHaveProperty("skill");
      expect(result.attributeScores).toHaveProperty("budget");
      expect(result.attributeScores).toHaveProperty("vibe");
      expect(result.attributeScores).toHaveProperty("season");

      // All scores should be 0-100
      Object.values(result.attributeScores).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  it("resort data passes through recommendation unchanged", async () => {
    const results = await getRecommendations(
      makePrefs({ regions: ["France"] }),
      3,
    );
    const allResorts = await getAllResortsAsync();

    results.forEach((result: { resort: Resort }) => {
      // Find same resort in raw fetched data
      const original = allResorts.find((r) => r.id === result.resort.id);
      expect(original).toBeDefined();

      // Verify key data was not mutated
      expect(result.resort.name).toBe(original!.name);
      expect(result.resort.country).toBe(original!.country);
      expect(result.resort.terrain).toEqual(original!.terrain);
      expect(result.resort.stats).toEqual(original!.stats);
      expect(result.resort.attributes.averageDailyCost).toBe(
        original!.attributes.averageDailyCost,
      );
      expect(result.resort.location).toEqual(original!.location);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Cache integrity — data stays consistent across calls
// ─────────────────────────────────────────────────────────────────────────────

describe("cache integrity", () => {
  it("subsequent calls return identical data", async () => {
    clearResortCache();
    const first = await getAllResortsAsync();
    const second = await getAllResortsAsync();

    expect(first).toEqual(second);
    expect(first.length).toBe(second.length);
  });

  it("getResortByIdAsync returns same data as getAllResortsAsync entry", async () => {
    clearResortCache();
    const all = await getAllResortsAsync();
    const firstResort = all[0];

    const byId = await getResortByIdAsync(firstResort.id);
    expect(byId).toEqual(firstResort);
  });

  it("clearResortCache forces a fresh fetch", async () => {
    const first = await getAllResortsAsync();
    clearResortCache();
    const second = await getAllResortsAsync();

    // Data should be equivalent (same source)
    expect(first).toEqual(second);
  });
});

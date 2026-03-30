import { getRecommendations } from "../index";

describe("getRecommendations", () => {
  it("returns up to 5 results by default", async () => {
    const results = await getRecommendations({
      tripType: null,
      groupAbilities: ["intermediate"],
      budgetLevel: "mid",
      regions: ["france-alps", "austria", "switzerland"],
      crowdPreference: 3,
      familyVsNightlife: 3,
      snowImportance: 3,
    });
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.length).toBeGreaterThan(0);
  });

  it("respects the limit parameter", async () => {
    const results = await getRecommendations(
      {
        tripType: null,
        groupAbilities: ["intermediate"],
        budgetLevel: "mid",
        regions: ["france-alps", "austria", "switzerland", "italy", "andorra-spain"],
        crowdPreference: 3,
        familyVsNightlife: 3,
        snowImportance: 3,
      },
      3,
    );
    expect(results).toHaveLength(3);
  });

  it("returns results sorted by match score descending", async () => {
    const results = await getRecommendations({
      tripType: null,
      groupAbilities: ["advanced"],
      budgetLevel: "luxury",
      regions: ["france-alps", "austria", "switzerland"],
      crowdPreference: 5,
      familyVsNightlife: 5,
      snowImportance: 5,
    });
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].matchScore).toBeGreaterThanOrEqual(results[i].matchScore);
    }
  });

  it("each result has a matchScore between 0 and 100", async () => {
    const results = await getRecommendations({
      tripType: null,
      groupAbilities: ["beginner"],
      budgetLevel: "budget",
      regions: ["france-alps"],
      crowdPreference: 1,
      familyVsNightlife: 1,
      snowImportance: 1,
    });
    results.forEach((r) => {
      expect(r.matchScore).toBeGreaterThanOrEqual(0);
      expect(r.matchScore).toBeLessThanOrEqual(100);
    });
  });

  it("each result has at least one match reason", async () => {
    const results = await getRecommendations({
      tripType: null,
      groupAbilities: ["intermediate"],
      budgetLevel: "mid",
      regions: ["france-alps"],
      crowdPreference: 3,
      familyVsNightlife: 3,
      snowImportance: 3,
    });
    results.forEach((r) => {
      expect(r.matchReasons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("filters results by region", async () => {
    const results = await getRecommendations(
      {
        tripType: null,
        groupAbilities: ["intermediate"],
        budgetLevel: "mid",
        regions: ["italy"],
        crowdPreference: 3,
        familyVsNightlife: 3,
        snowImportance: 3,
      },
      10,
    );
    results.forEach((r) => {
      expect(r.resort.country).toBe("Italy");
    });
  });

  it("returns empty when no resorts match region", async () => {
    const results = await getRecommendations({
      tripType: null,
      groupAbilities: ["intermediate"],
      budgetLevel: "mid",
      regions: ["north-pole"],
      crowdPreference: 3,
      familyVsNightlife: 3,
      snowImportance: 3,
    });
    expect(results).toHaveLength(0);
  });
});

import {
  getAllResortsAsync,
  getResortByIdAsync,
  getResortsByRegionAsync,
  clearResortCache,
} from "../resort";

// Clear cache before each test so fetchCloudResorts always runs
beforeEach(() => {
  clearResortCache();
});

describe("getAllResortsAsync", () => {
  it("returns resorts", async () => {
    const resorts = await getAllResortsAsync();
    expect(resorts.length).toBeGreaterThan(0);
  });

  it("every resort has required fields", async () => {
    const resorts = await getAllResortsAsync();
    resorts.forEach((resort) => {
      expect(resort.id).toBeTruthy();
      expect(resort.name).toBeTruthy();
      expect(resort.country).toBeTruthy();
      const terrainSum =
        resort.terrain.beginner + resort.terrain.intermediate + resort.terrain.advanced;
      expect(terrainSum).toBeGreaterThanOrEqual(99);
      expect(terrainSum).toBeLessThanOrEqual(101);
    });
  });

  it("returns 6 resorts from the mock", async () => {
    const resorts = await getAllResortsAsync();
    expect(resorts).toHaveLength(6);
  });
});

describe("getResortByIdAsync", () => {
  it("returns the correct resort by id", async () => {
    const resort = await getResortByIdAsync("val-thorens");
    expect(resort).toBeDefined();
    expect(resort!.name).toBe("Val Thorens");
  });

  it("returns undefined for unknown id", async () => {
    const resort = await getResortByIdAsync("nonexistent-id");
    expect(resort).toBeUndefined();
  });
});

describe("getResortsByRegionAsync", () => {
  it("returns all resorts when given empty countries array", async () => {
    const resorts = await getResortsByRegionAsync([]);
    expect(resorts).toHaveLength(6);
  });

  it("filters French resorts correctly", async () => {
    const french = await getResortsByRegionAsync(["France"]);
    expect(french.length).toBeGreaterThan(0);
    french.forEach((r) => expect(r.country).toBe("France"));
  });

  it("filters Austrian resorts correctly", async () => {
    const austrian = await getResortsByRegionAsync(["Austria"]);
    expect(austrian.length).toBeGreaterThan(0);
    austrian.forEach((r) => expect(r.country).toBe("Austria"));
  });

  it("filters Swiss resorts correctly", async () => {
    const swiss = await getResortsByRegionAsync(["Switzerland"]);
    expect(swiss.length).toBeGreaterThan(0);
    swiss.forEach((r) => expect(r.country).toBe("Switzerland"));
  });

  it("filters Italian resorts correctly", async () => {
    const italian = await getResortsByRegionAsync(["Italy"]);
    expect(italian.length).toBeGreaterThan(0);
    italian.forEach((r) => expect(r.country).toBe("Italy"));
  });

  it("filters Andorran resorts correctly", async () => {
    const andorran = await getResortsByRegionAsync(["Andorra"]);
    expect(andorran.length).toBeGreaterThan(0);
    andorran.forEach((r) => expect(r.country).toBe("Andorra"));
  });

  it("combines multiple countries", async () => {
    const french = await getResortsByRegionAsync(["France"]);
    const austrian = await getResortsByRegionAsync(["Austria"]);
    const combined = await getResortsByRegionAsync(["France", "Austria"]);
    expect(combined).toHaveLength(french.length + austrian.length);
  });

  it("returns empty array for unknown country", async () => {
    const resorts = await getResortsByRegionAsync(["Narnia"]);
    expect(resorts).toHaveLength(0);
  });
});


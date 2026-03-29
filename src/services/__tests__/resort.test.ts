import { getAllResorts, getResortById, getResortsByRegion } from "../resort";

describe("getAllResorts", () => {
  it("returns all 30 resorts", () => {
    expect(getAllResorts()).toHaveLength(30);
  });

  it("every resort has required fields", () => {
    getAllResorts().forEach((resort) => {
      expect(resort.id).toBeTruthy();
      expect(resort.name).toBeTruthy();
      expect(resort.country).toBeTruthy();
      expect(resort.terrain.beginner + resort.terrain.intermediate + resort.terrain.advanced).toBe(100);
    });
  });
});

describe("getResortById", () => {
  it("returns the correct resort by id", () => {
    const resort = getResortById("val-thorens");
    expect(resort).toBeDefined();
    expect(resort!.name).toBe("Val Thorens");
  });

  it("returns undefined for unknown id", () => {
    expect(getResortById("nonexistent-id")).toBeUndefined();
  });
});

describe("getResortsByRegion", () => {
  it("returns all resorts when given empty regions array", () => {
    expect(getResortsByRegion([])).toHaveLength(30);
  });

  it("filters French resorts correctly", () => {
    const french = getResortsByRegion(["france-alps"]);
    expect(french.length).toBeGreaterThan(0);
    french.forEach((r) => expect(r.country).toBe("France"));
  });

  it("filters Austrian resorts correctly", () => {
    const austrian = getResortsByRegion(["austria"]);
    expect(austrian.length).toBeGreaterThan(0);
    austrian.forEach((r) => expect(r.country).toBe("Austria"));
  });

  it("filters Swiss resorts correctly", () => {
    const swiss = getResortsByRegion(["switzerland"]);
    expect(swiss.length).toBeGreaterThan(0);
    swiss.forEach((r) => expect(r.country).toBe("Switzerland"));
  });

  it("filters Italian resorts correctly", () => {
    const italian = getResortsByRegion(["italy"]);
    expect(italian.length).toBeGreaterThan(0);
    italian.forEach((r) => expect(r.country).toBe("Italy"));
  });

  it("filters Andorra/Spain resorts correctly", () => {
    const pyrenees = getResortsByRegion(["andorra-spain"]);
    expect(pyrenees.length).toBeGreaterThan(0);
    pyrenees.forEach((r) =>
      expect(["Andorra", "Spain"]).toContain(r.country)
    );
  });

  it("combines multiple regions", () => {
    const french = getResortsByRegion(["france-alps"]);
    const austrian = getResortsByRegion(["austria"]);
    const combined = getResortsByRegion(["france-alps", "austria"]);
    expect(combined).toHaveLength(french.length + austrian.length);
  });

  it("returns empty array for unknown region", () => {
    expect(getResortsByRegion(["north-pole"])).toHaveLength(0);
  });
});

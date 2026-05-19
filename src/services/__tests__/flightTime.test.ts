import {
  getFlightTimeMinutes,
  formatFlightTime,
} from "@services/flightTime";

describe("getFlightTimeMinutes", () => {
  it("returns a reasonable time for LHR → GVA (~750 km)", () => {
    const mins = getFlightTimeMinutes("LHR", "GVA");
    expect(mins).not.toBeNull();
    // ~1h flight + 30 min overhead ≈ 85-90 min
    expect(mins!).toBeGreaterThanOrEqual(75);
    expect(mins!).toBeLessThanOrEqual(100);
  });

  it("returns a longer time for JFK → GVA (~6000 km)", () => {
    const mins = getFlightTimeMinutes("JFK", "GVA");
    expect(mins).not.toBeNull();
    // ~7.5h flight + 30 min overhead ≈ 480 min
    expect(mins!).toBeGreaterThanOrEqual(440);
    expect(mins!).toBeLessThanOrEqual(520);
  });

  it("returns null when origin airport is unknown", () => {
    expect(getFlightTimeMinutes("XXX", "GVA")).toBeNull();
  });

  it("returns null when destination airport is unknown", () => {
    expect(getFlightTimeMinutes("LHR", "XXX")).toBeNull();
  });

  it("returns a small value for nearby airports (ZRH → INN)", () => {
    const mins = getFlightTimeMinutes("ZRH", "INN");
    expect(mins).not.toBeNull();
    // ~240 km → ~48 min total
    expect(mins!).toBeLessThanOrEqual(60);
  });
});

describe("formatFlightTime", () => {
  it("formats minutes-only correctly", () => {
    expect(formatFlightTime(45)).toBe("45m");
  });

  it("formats hours + minutes correctly", () => {
    expect(formatFlightTime(95)).toBe("1h 35m");
  });

  it("formats exact hours correctly", () => {
    expect(formatFlightTime(120)).toBe("2h");
  });

  it("formats zero minutes", () => {
    expect(formatFlightTime(0)).toBe("0m");
  });
});

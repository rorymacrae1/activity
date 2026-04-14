import {
  setHomeAirport,
  getHomeAirport,
  getVisitedResorts,
  addVisitedResort,
  removeVisitedResort,
  hasVisitedResort,
  getProfileCompletionStatus,
} from "@services/profile";

// ─── Supabase mock ───────────────────────────────────────────────────────────

const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockUpsert = jest.fn();
const mockDelete = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: jest.fn(),
  },
}));

function getSupabaseMock() {
  return jest.requireMock("@/lib/supabase").supabase;
}

// ─── Chain helpers ───────────────────────────────────────────────────────────

function setupUpdateChain(error: { message: string } | null = null) {
  const updateEq = jest.fn().mockResolvedValue({ error });
  mockUpdate.mockReturnValue({ eq: updateEq });
  getSupabaseMock().from.mockReturnValue({ update: mockUpdate });
}

function setupSelectSingleChain(
  data: unknown,
  error: { message: string } | null = null,
) {
  mockSingle.mockResolvedValue({ data, error });
  mockEq.mockReturnValue({ single: mockSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  getSupabaseMock().from.mockReturnValue({ select: mockSelect });
}

function setupSelectOrderChain(
  data: unknown[],
  error: { message: string } | null = null,
) {
  mockOrder.mockResolvedValue({ data: error ? null : data, error });
  const selectEq = jest.fn().mockReturnValue({ order: mockOrder });
  mockSelect.mockReturnValue({ eq: selectEq });
  getSupabaseMock().from.mockReturnValue({ select: mockSelect });
}

function setupSelectEqEqSingle(data: unknown) {
  mockSingle.mockResolvedValue({ data, error: null });
  const eq2 = jest.fn().mockReturnValue({ single: mockSingle });
  const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
  mockSelect.mockReturnValue({ eq: eq1 });
  getSupabaseMock().from.mockReturnValue({ select: mockSelect });
}

function setupUpsertChain(error: { message: string } | null = null) {
  mockUpsert.mockResolvedValue({ error });
  getSupabaseMock().from.mockReturnValue({ upsert: mockUpsert });
}

function setupDeleteChain(error: { message: string } | null = null) {
  const deleteEq2 = jest.fn().mockResolvedValue({ error });
  const deleteEq1 = jest.fn().mockReturnValue({ eq: deleteEq2 });
  mockDelete.mockReturnValue({ eq: deleteEq1 });
  getSupabaseMock().from.mockReturnValue({ delete: mockDelete });
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const USER_ID = "user-123";

const VISITED_RESORT = {
  id: "vr-1",
  user_id: USER_ID,
  resort_id: "val-thorens",
  visited_at: "2025-02-15T00:00:00Z",
  notes: "Great powder",
  rating: 4,
  created_at: "2025-03-01T00:00:00Z",
};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("setHomeAirport", () => {
  it("updates home_airport in profiles table", async () => {
    setupUpdateChain(null);

    const result = await setHomeAirport(USER_ID, "LHR");

    expect(result.error).toBeNull();
    expect(getSupabaseMock().from).toHaveBeenCalledWith("profiles");
  });

  it("returns error on failure", async () => {
    setupUpdateChain({ message: "Update failed" });

    const result = await setHomeAirport(USER_ID, "LHR");

    expect(result.error).toEqual(new Error("Update failed"));
  });

  it("returns error when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await setHomeAirport(USER_ID, "LHR");

    expect(result.error).toEqual(new Error("Supabase not configured"));
    mod.supabase = orig;
  });
});

describe("getHomeAirport", () => {
  it("returns airport code on success", async () => {
    setupSelectSingleChain({ home_airport: "LHR" });

    const result = await getHomeAirport(USER_ID);

    expect(result).toBe("LHR");
    expect(getSupabaseMock().from).toHaveBeenCalledWith("profiles");
  });

  it("returns null when no airport set", async () => {
    setupSelectSingleChain({ home_airport: null });

    const result = await getHomeAirport(USER_ID);

    expect(result).toBeNull();
  });

  it("returns null when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await getHomeAirport(USER_ID);

    expect(result).toBeNull();
    mod.supabase = orig;
  });
});

describe("getVisitedResorts", () => {
  it("returns array of visited resorts", async () => {
    setupSelectOrderChain([VISITED_RESORT]);

    const result = await getVisitedResorts(USER_ID);

    expect(result).toEqual([VISITED_RESORT]);
    expect(getSupabaseMock().from).toHaveBeenCalledWith("visited_resorts");
  });

  it("returns empty array on error", async () => {
    setupSelectOrderChain([], { message: "Fetch failed" });

    const result = await getVisitedResorts(USER_ID);

    expect(result).toEqual([]);
  });

  it("returns empty array when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await getVisitedResorts(USER_ID);

    expect(result).toEqual([]);
    mod.supabase = orig;
  });
});

describe("addVisitedResort", () => {
  it("upserts visited resort", async () => {
    setupUpsertChain(null);

    const result = await addVisitedResort(USER_ID, "val-thorens");

    expect(result.error).toBeNull();
    expect(getSupabaseMock().from).toHaveBeenCalledWith("visited_resorts");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_ID,
        resort_id: "val-thorens",
      }),
      { onConflict: "user_id,resort_id" },
    );
  });

  it("passes options when provided", async () => {
    setupUpsertChain(null);
    const visitedAt = new Date("2025-02-15");

    await addVisitedResort(USER_ID, "val-thorens", {
      visitedAt,
      notes: "Great snow",
      rating: 5,
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        visited_at: visitedAt.toISOString(),
        notes: "Great snow",
        rating: 5,
      }),
      expect.any(Object),
    );
  });

  it("returns error on failure", async () => {
    setupUpsertChain({ message: "Upsert failed" });

    const result = await addVisitedResort(USER_ID, "val-thorens");

    expect(result.error).toEqual(new Error("Upsert failed"));
  });

  it("returns error when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await addVisitedResort(USER_ID, "val-thorens");

    expect(result.error).toEqual(new Error("Supabase not configured"));
    mod.supabase = orig;
  });
});

describe("removeVisitedResort", () => {
  it("deletes visited resort", async () => {
    setupDeleteChain(null);

    const result = await removeVisitedResort(USER_ID, "val-thorens");

    expect(result.error).toBeNull();
    expect(getSupabaseMock().from).toHaveBeenCalledWith("visited_resorts");
  });

  it("returns error on failure", async () => {
    setupDeleteChain({ message: "Delete failed" });

    const result = await removeVisitedResort(USER_ID, "val-thorens");

    expect(result.error).toEqual(new Error("Delete failed"));
  });

  it("returns error when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await removeVisitedResort(USER_ID, "val-thorens");

    expect(result.error).toEqual(new Error("Supabase not configured"));
    mod.supabase = orig;
  });
});

describe("hasVisitedResort", () => {
  it("returns true when resort exists", async () => {
    setupSelectEqEqSingle({ id: "vr-1" });

    const result = await hasVisitedResort(USER_ID, "val-thorens");

    expect(result).toBe(true);
  });

  it("returns false when resort not found", async () => {
    setupSelectEqEqSingle(null);

    const result = await hasVisitedResort(USER_ID, "val-thorens");

    expect(result).toBe(false);
  });

  it("returns false when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await hasVisitedResort(USER_ID, "val-thorens");

    expect(result).toBe(false);
    mod.supabase = orig;
  });
});

describe("getProfileCompletionStatus", () => {
  it("returns complete when all items present", async () => {
    // getHomeAirport
    setupSelectSingleChain({ home_airport: "LHR" });
    // getVisitedResorts — setup after first call
    const fromMock = getSupabaseMock().from;
    let callCount = 0;
    fromMock.mockImplementation((table: string) => {
      callCount++;
      if (table === "profiles") {
        const selectSingle = {
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { home_airport: "LHR" },
              error: null,
            }),
          }),
        };
        return { select: jest.fn().mockReturnValue(selectSingle) };
      }
      if (table === "visited_resorts") {
        const orderResult = jest.fn().mockResolvedValue({
          data: [VISITED_RESORT],
          error: null,
        });
        const eqResult = jest.fn().mockReturnValue({ order: orderResult });
        return {
          select: jest.fn().mockReturnValue({ eq: eqResult }),
        };
      }
      return { select: jest.fn().mockReturnValue({ eq: jest.fn() }) };
    });

    const result = await getProfileCompletionStatus(USER_ID, 3);

    expect(result.hasHomeAirport).toBe(true);
    expect(result.hasVisitedResorts).toBe(true);
    expect(result.hasFavorites).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.completionPercentage).toBe(100);
  });

  it("returns partial when some items missing", async () => {
    const fromMock = getSupabaseMock().from;
    fromMock.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { home_airport: null },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "visited_resorts") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }
      return { select: jest.fn() };
    });

    const result = await getProfileCompletionStatus(USER_ID, 0);

    expect(result.hasHomeAirport).toBe(false);
    expect(result.hasVisitedResorts).toBe(false);
    expect(result.hasFavorites).toBe(false);
    expect(result.isComplete).toBe(false);
    expect(result.completionPercentage).toBe(0);
  });

  it("counts favorites from argument, not database", async () => {
    const fromMock = getSupabaseMock().from;
    fromMock.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { home_airport: null },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "visited_resorts") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }
      return { select: jest.fn() };
    });

    const result = await getProfileCompletionStatus(USER_ID, 5);

    expect(result.hasFavorites).toBe(true);
    expect(result.completionPercentage).toBe(33);
  });
});

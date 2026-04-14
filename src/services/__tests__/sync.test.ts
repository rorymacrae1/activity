import {
  fetchCloudPreferences,
  saveCloudPreferences,
  cloudToLocalPreferences,
  fetchCloudFavorites,
  addCloudFavorite,
  removeCloudFavorite,
  syncAllFavoritesToCloud,
  mergeFavorites,
  mergePreferences,
} from "@services/sync";
import type { LocalPreferences } from "@services/sync";
import type { UserPreferences } from "@/types/supabase";

// ─── Supabase mock ───────────────────────────────────────────────────────────

const mockSelect = jest.fn();
const mockUpsert = jest.fn();
const mockInsert = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: jest.fn(),
  },
}));

function getSupabaseMock() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return jest.requireMock("@/lib/supabase").supabase;
}

// Chain helpers
function setupSelectChain(
  data: unknown,
  error: { message: string } | null = null,
) {
  mockSingle.mockResolvedValue({ data, error });
  mockEq.mockReturnValue({ single: mockSingle, then: undefined });
  mockSelect.mockReturnValue({ eq: mockEq });
  getSupabaseMock().from.mockReturnValue({ select: mockSelect });
}

function setupSelectArrayChain(
  data: unknown[],
  error: { message: string } | null = null,
) {
  const eqResult = error
    ? Promise.resolve({ data: null, error })
    : Promise.resolve({ data, error: null });
  // Make eq return a thenable so await works directly
  mockEq.mockReturnValue(eqResult);
  mockSelect.mockReturnValue({ eq: mockEq });
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
  getSupabaseMock().from.mockReturnValue({
    delete: mockDelete,
    insert: mockInsert,
  });
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const LOCAL_PREFS: LocalPreferences = {
  hasCompletedOnboarding: true,
  tripType: "couple",
  groupAbilities: ["intermediate"],
  budgetLevel: "mid",
  regions: ["france-alps", "austria"],
  crowdPreference: 3,
  familyVsNightlife: 4,
  snowImportance: 4,
  language: "en",
};

const CLOUD_PREFS: UserPreferences = {
  id: "pref-1",
  user_id: "user-123",
  has_completed_onboarding: true,
  trip_type: "family",
  group_abilities: ["beginner", "intermediate"],
  budget_level: "budget",
  regions: ["switzerland"],
  crowd_preference: 2,
  family_vs_nightlife: 2,
  snow_importance: 5,
  language: "de",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const USER_ID = "user-123";

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("fetchCloudPreferences", () => {
  it("returns preferences on success", async () => {
    setupSelectChain(CLOUD_PREFS);

    const result = await fetchCloudPreferences(USER_ID);

    expect(getSupabaseMock().from).toHaveBeenCalledWith("user_preferences");
    expect(result).toEqual(CLOUD_PREFS);
  });

  it("returns null on error", async () => {
    setupSelectChain(null, { message: "Network error" });

    const result = await fetchCloudPreferences(USER_ID);

    expect(result).toBeNull();
  });

  it("returns null when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await fetchCloudPreferences(USER_ID);

    expect(result).toBeNull();
    mod.supabase = orig;
  });
});

describe("saveCloudPreferences", () => {
  it("upserts preferences to supabase", async () => {
    setupUpsertChain(null);

    const result = await saveCloudPreferences(USER_ID, LOCAL_PREFS);

    expect(result.error).toBeNull();
    expect(getSupabaseMock().from).toHaveBeenCalledWith("user_preferences");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_ID,
        has_completed_onboarding: true,
        trip_type: "couple",
        group_abilities: ["intermediate"],
        budget_level: "mid",
        regions: ["france-alps", "austria"],
        crowd_preference: 3,
        family_vs_nightlife: 4,
        snow_importance: 4,
        language: "en",
      }),
      { onConflict: "user_id" },
    );
  });

  it("returns error on failure", async () => {
    setupUpsertChain({ message: "Insert failed" });

    const result = await saveCloudPreferences(USER_ID, LOCAL_PREFS);

    expect(result.error).toEqual(new Error("Insert failed"));
  });

  it("returns error when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await saveCloudPreferences(USER_ID, LOCAL_PREFS);

    expect(result.error).toEqual(new Error("Supabase not configured"));
    mod.supabase = orig;
  });
});

describe("cloudToLocalPreferences", () => {
  it("converts cloud format to local format", () => {
    const local = cloudToLocalPreferences(CLOUD_PREFS);

    expect(local).toEqual({
      hasCompletedOnboarding: true,
      tripType: "family",
      groupAbilities: ["beginner", "intermediate"],
      budgetLevel: "budget",
      regions: ["switzerland"],
      crowdPreference: 2,
      familyVsNightlife: 2,
      snowImportance: 5,
      language: "de",
    });
  });
});

describe("fetchCloudFavorites", () => {
  it("returns array of resort IDs on success", async () => {
    setupSelectArrayChain([
      { resort_id: "val-thorens" },
      { resort_id: "chamonix" },
    ]);

    const result = await fetchCloudFavorites(USER_ID);

    expect(getSupabaseMock().from).toHaveBeenCalledWith("user_favorites");
    expect(result).toEqual(["val-thorens", "chamonix"]);
  });

  it("returns null on error", async () => {
    setupSelectArrayChain([], { message: "Fetch failed" });

    const result = await fetchCloudFavorites(USER_ID);

    expect(result).toBeNull();
  });

  it("returns empty array when no favorites", async () => {
    setupSelectArrayChain([]);

    const result = await fetchCloudFavorites(USER_ID);

    expect(result).toEqual([]);
  });

  it("returns null when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await fetchCloudFavorites(USER_ID);

    expect(result).toBeNull();
    mod.supabase = orig;
  });
});

describe("addCloudFavorite", () => {
  it("upserts favorite to supabase", async () => {
    setupUpsertChain(null);

    const result = await addCloudFavorite(USER_ID, "val-thorens");

    expect(result.error).toBeNull();
    expect(getSupabaseMock().from).toHaveBeenCalledWith("user_favorites");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_ID,
        resort_id: "val-thorens",
      }),
      { onConflict: "user_id,resort_id" },
    );
  });

  it("returns error on failure", async () => {
    setupUpsertChain({ message: "Upsert failed" });

    const result = await addCloudFavorite(USER_ID, "val-thorens");

    expect(result.error).toEqual(new Error("Upsert failed"));
  });

  it("returns error when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await addCloudFavorite(USER_ID, "val-thorens");

    expect(result.error).toEqual(new Error("Supabase not configured"));
    mod.supabase = orig;
  });
});

describe("removeCloudFavorite", () => {
  it("deletes favorite from supabase", async () => {
    setupDeleteChain(null);

    const result = await removeCloudFavorite(USER_ID, "val-thorens");

    expect(result.error).toBeNull();
    expect(getSupabaseMock().from).toHaveBeenCalledWith("user_favorites");
  });

  it("returns error on failure", async () => {
    setupDeleteChain({ message: "Delete failed" });

    const result = await removeCloudFavorite(USER_ID, "val-thorens");

    expect(result.error).toEqual(new Error("Delete failed"));
  });

  it("returns error when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await removeCloudFavorite(USER_ID, "val-thorens");

    expect(result.error).toEqual(new Error("Supabase not configured"));
    mod.supabase = orig;
  });
});

describe("syncAllFavoritesToCloud", () => {
  it("deletes then inserts all local favorites", async () => {
    // Delete succeeds
    const deleteEq = jest.fn().mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: deleteEq });
    // Insert succeeds
    mockInsert.mockResolvedValue({ error: null });

    getSupabaseMock().from.mockReturnValue({
      delete: jest.fn().mockReturnValue({ eq: deleteEq }),
      insert: mockInsert,
    });

    const result = await syncAllFavoritesToCloud(USER_ID, [
      "val-thorens",
      "chamonix",
    ]);

    expect(result.error).toBeNull();
  });

  it("skips insert when local favorites is empty", async () => {
    const deleteEq = jest.fn().mockResolvedValue({ error: null });

    getSupabaseMock().from.mockReturnValue({
      delete: jest.fn().mockReturnValue({ eq: deleteEq }),
      insert: mockInsert,
    });

    const result = await syncAllFavoritesToCloud(USER_ID, []);

    expect(result.error).toBeNull();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns error when delete fails", async () => {
    const deleteEq = jest
      .fn()
      .mockResolvedValue({ error: { message: "Delete failed" } });

    getSupabaseMock().from.mockReturnValue({
      delete: jest.fn().mockReturnValue({ eq: deleteEq }),
    });

    const result = await syncAllFavoritesToCloud(USER_ID, ["val-thorens"]);

    expect(result.error).toEqual(new Error("Delete failed"));
  });

  it("returns error when insert fails", async () => {
    const deleteEq = jest.fn().mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: { message: "Insert failed" } });

    getSupabaseMock().from.mockReturnValue({
      delete: jest.fn().mockReturnValue({ eq: deleteEq }),
      insert: mockInsert,
    });

    const result = await syncAllFavoritesToCloud(USER_ID, ["val-thorens"]);

    expect(result.error).toEqual(new Error("Insert failed"));
  });

  it("returns error when supabase not configured", async () => {
    const mod = jest.requireMock("@/lib/supabase");
    const orig = mod.supabase;
    mod.supabase = null;

    const result = await syncAllFavoritesToCloud(USER_ID, ["val-thorens"]);

    expect(result.error).toEqual(new Error("Supabase not configured"));
    mod.supabase = orig;
  });
});

// ─── Pure merge functions ────────────────────────────────────────────────────

describe("mergeFavorites", () => {
  it("returns union of local and cloud favorites", () => {
    const result = mergeFavorites(
      ["val-thorens", "chamonix"],
      ["chamonix", "zermatt"],
    );
    expect(result).toEqual(
      expect.arrayContaining(["val-thorens", "chamonix", "zermatt"]),
    );
    expect(result).toHaveLength(3);
  });

  it("handles empty local", () => {
    const result = mergeFavorites([], ["chamonix"]);
    expect(result).toEqual(["chamonix"]);
  });

  it("handles empty cloud", () => {
    const result = mergeFavorites(["val-thorens"], []);
    expect(result).toEqual(["val-thorens"]);
  });

  it("handles both empty", () => {
    const result = mergeFavorites([], []);
    expect(result).toEqual([]);
  });

  it("deduplicates", () => {
    const result = mergeFavorites(["x", "y"], ["y", "x"]);
    expect(result).toHaveLength(2);
  });
});

describe("mergePreferences", () => {
  it("uses cloud when cloud has completed onboarding", () => {
    const result = mergePreferences(LOCAL_PREFS, CLOUD_PREFS);

    expect(result.tripType).toBe("family"); // cloud value
    expect(result.budgetLevel).toBe("budget"); // cloud value
    expect(result.language).toBe("de"); // cloud value
  });

  it("uses local when cloud has not completed onboarding", () => {
    const incompleteCloud: UserPreferences = {
      ...CLOUD_PREFS,
      has_completed_onboarding: false,
    };

    const result = mergePreferences(LOCAL_PREFS, incompleteCloud);

    expect(result.tripType).toBe("couple"); // local value
    expect(result.budgetLevel).toBe("mid"); // local value
    expect(result.language).toBe("en"); // local value
  });

  it("converts cloud format to local format when using cloud", () => {
    const result = mergePreferences(LOCAL_PREFS, CLOUD_PREFS);

    // Should have camelCase keys, not snake_case
    expect(result).toHaveProperty("hasCompletedOnboarding");
    expect(result).toHaveProperty("tripType");
    expect(result).toHaveProperty("groupAbilities");
    expect(result).toHaveProperty("budgetLevel");
    expect(result).toHaveProperty("crowdPreference");
    expect(result).toHaveProperty("familyVsNightlife");
    expect(result).toHaveProperty("snowImportance");
  });
});

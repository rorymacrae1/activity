/**
 * Mock for src/lib/supabase.
 * Returns a fake Supabase client backed by a small in-memory resort dataset
 * shaped as flat columns to match the actual Supabase `resort` table.
 */

interface MockResortRow {
  id: string;
  name: string;
  country: string;
  region: string | null;
  continent: string | null;
  lat: number;
  lng: number;
  min_altitude_m: number;
  max_altitude_m: number;
  altitude_base_m: number | null;
  altitude_top_m: number | null;
  total_km_piste: number;
  blue_runs: number;
  red_runs: number;
  black_runs: number;
  beginner_area: boolean;
  snow_park: boolean;
  off_piste: boolean;
  off_piste_score: number | null;
  backcountry_access: boolean;
  snow_sure_rating: number;
  apres_ski_rating: number;
  train_accessible: boolean;
  eurostar_direct: boolean;
  train_journey_hours: number | null;
  drive_hours_from_london: number | null;
  car_free_town: boolean;
  style: string | null;
  hero_image: string | null;
  created_at: string;
  last_updated: string | null;
  location: unknown;
  embedding: unknown;
}

const DEFAULTS: MockResortRow = {
  id: "default",
  name: "Default Resort",
  country: "France",
  region: null,
  continent: "Europe",
  lat: 45.0,
  lng: 6.0,
  min_altitude_m: 1500,
  max_altitude_m: 2500,
  altitude_base_m: null,
  altitude_top_m: null,
  total_km_piste: 150,
  blue_runs: 20,
  red_runs: 30,
  black_runs: 15,
  beginner_area: true,
  snow_park: false,
  off_piste: false,
  off_piste_score: null,
  backcountry_access: false,
  snow_sure_rating: 3,
  apres_ski_rating: 3,
  train_accessible: false,
  eurostar_direct: false,
  train_journey_hours: null,
  drive_hours_from_london: null,
  car_free_town: false,
  style: null,
  hero_image: null,
  created_at: "2024-01-01T00:00:00Z",
  last_updated: "2024-01-01T00:00:00Z",
  location: null,
  embedding: null,
};

function createMockResort(overrides: Partial<MockResortRow>): MockResortRow {
  return { ...DEFAULTS, ...overrides };
}

const MOCK_RESORTS: MockResortRow[] = [
  createMockResort({
    id: "val-thorens",
    name: "Val Thorens",
    region: "Savoie",
    lat: 45.298,
    lng: 6.58,
    min_altitude_m: 2300,
    max_altitude_m: 3230,
    total_km_piste: 600,
    blue_runs: 30,
    red_runs: 60,
    black_runs: 30,
    snow_park: true,
    off_piste: true,
    off_piste_score: 3,
    backcountry_access: true,
    snow_sure_rating: 5,
    apres_ski_rating: 5,
    car_free_town: true,
    style: "Purpose-built",
    hero_image: "https://example.com/val-thorens.jpg",
  }),
  createMockResort({
    id: "chamonix",
    name: "Chamonix",
    region: "Haute-Savoie",
    lat: 45.924,
    lng: 6.869,
    min_altitude_m: 1035,
    max_altitude_m: 3842,
    total_km_piste: 152,
    blue_runs: 10,
    red_runs: 25,
    black_runs: 35,
    beginner_area: false,
    off_piste: true,
    off_piste_score: 5,
    backcountry_access: true,
    snow_sure_rating: 4,
    apres_ski_rating: 4,
    style: "Lively town",
    hero_image: "https://example.com/chamonix.jpg",
  }),
  createMockResort({
    id: "st-anton",
    name: "St Anton",
    country: "Austria",
    region: "Tyrol",
    lat: 47.129,
    lng: 10.268,
    min_altitude_m: 1304,
    max_altitude_m: 2811,
    total_km_piste: 301,
    blue_runs: 15,
    red_runs: 40,
    black_runs: 30,
    beginner_area: false,
    snow_park: true,
    off_piste: true,
    off_piste_score: 4,
    backcountry_access: true,
    snow_sure_rating: 4,
    apres_ski_rating: 5,
    style: "Lively town",
    hero_image: "https://example.com/st-anton.jpg",
  }),
  createMockResort({
    id: "verbier",
    name: "Verbier",
    country: "Switzerland",
    region: "Valais",
    lat: 46.096,
    lng: 7.228,
    min_altitude_m: 1500,
    max_altitude_m: 3330,
    total_km_piste: 412,
    blue_runs: 100,
    red_runs: 120,
    black_runs: 60,
    snow_park: true,
    off_piste: true,
    off_piste_score: 5,
    backcountry_access: true,
    snow_sure_rating: 4,
    apres_ski_rating: 5,
    style: "Modern resort",
    hero_image: "https://example.com/verbier.jpg",
  }),
  createMockResort({
    id: "grandvalira",
    name: "Grandvalira",
    country: "Andorra",
    region: "Encamp",
    lat: 42.551,
    lng: 1.736,
    min_altitude_m: 1710,
    max_altitude_m: 2640,
    total_km_piste: 215,
    blue_runs: 33,
    red_runs: 55,
    black_runs: 22,
    snow_park: true,
  }),
  createMockResort({
    id: "cortina",
    name: "Cortina d'Ampezzo",
    country: "Italy",
    region: "Veneto",
    lat: 46.537,
    lng: 12.139,
    min_altitude_m: 1224,
    max_altitude_m: 2828,
    total_km_piste: 120,
    blue_runs: 13,
    red_runs: 25,
    black_runs: 14,
    train_accessible: true,
    train_journey_hours: 5,
    style: "Traditional village",
  }),
];

// ─── Fake chainable Supabase query builder ───────────────────────────────────

function makeBuilder(rows: MockResortRow[]) {
  const builder = {
    _rows: rows,
    select: (_cols: string) => builder,
    order: (_col: string) => builder,
    eq: (col: string, val: unknown) => {
      builder._rows = builder._rows.filter(
        (r) => (r as unknown as Record<string, unknown>)[col] === val,
      );
      return builder;
    },
    in: (col: string, vals: unknown[]) => {
      builder._rows = builder._rows.filter((r) =>
        vals.includes((r as unknown as Record<string, unknown>)[col]),
      );
      return builder;
    },
    limit: (n: number) => {
      builder._rows = builder._rows.slice(0, n);
      return builder;
    },
    not: (_col: string, _op: string, _val: unknown) => builder,
    single: () =>
      Promise.resolve({ data: builder._rows[0] ?? null, error: null }),
    then: (resolve: (v: { data: MockResortRow[]; error: null }) => void) =>
      resolve({ data: builder._rows, error: null }),
  };
  return builder;
}

export const MOCK_RESORT_DATA = MOCK_RESORTS;

export const isSupabaseConfigured = true;

export const supabase = {
  from: (table: string) => {
    if (table === "resort") return makeBuilder([...MOCK_RESORTS]);
    // All supplementary tables return empty results in tests
    return makeBuilder([]);
  },
};

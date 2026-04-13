/**
 * Mock for src/lib/supabase.
 * Returns a fake Supabase client backed by a small in-memory resort dataset
 * shaped exactly like the Supabase `resort` table (SupabaseResortRow) so the
 * service's supabaseRowToResort mapper runs against it correctly.
 */

// Local mirror of SupabaseResortRow — avoids importing from the service
interface MockResortRow {
  id: string;
  name: string;
  country: string;
  region: string;
  location: string;
  altitude_base_m: number;
  altitude_top_m: number;
  car_free_town: boolean;
  style: string;
  snow_sure_score: number;
  total_km_piste: number;
  blue_runs: number;
  red_runs: number;
  black_runs: number;
  beginner_area: boolean;
  snow_park: boolean;
  off_piste: boolean;
  disability_access: boolean;
  olympic_history: boolean;
  olympic_detail: string | null;
  embedding: unknown;
  last_updated: string;
  created_at: string;
  hero_image: string | null;
}

const MOCK_RESORTS: MockResortRow[] = [
  {
    id: "val-thorens",
    name: "Val Thorens",
    country: "France",
    region: "Savoie",
    location: "",
    altitude_base_m: 2300,
    altitude_top_m: 3230,
    car_free_town: true,
    style: "modern",
    snow_sure_score: 5,
    total_km_piste: 600,
    blue_runs: 30,
    red_runs: 60,
    black_runs: 30,
    beginner_area: true,
    snow_park: true,
    off_piste: false,
    disability_access: true,
    olympic_history: false,
    olympic_detail: null,
    embedding: null,
    last_updated: "2024-01-01",
    created_at: "2024-01-01",
    hero_image: "https://example.com/val-thorens.jpg",
  },
  {
    id: "chamonix",
    name: "Chamonix",
    country: "France",
    region: "Haute-Savoie",
    location: "",
    altitude_base_m: 1035,
    altitude_top_m: 3842,
    car_free_town: false,
    style: "traditional",
    snow_sure_score: 4,
    total_km_piste: 152,
    blue_runs: 10,
    red_runs: 25,
    black_runs: 35,
    beginner_area: false,
    snow_park: false,
    off_piste: true,
    disability_access: true,
    olympic_history: true,
    olympic_detail: "1924 Winter Olympics",
    embedding: null,
    last_updated: "2024-01-01",
    created_at: "2024-01-01",
    hero_image: "https://example.com/chamonix.jpg",
  },
  {
    id: "st-anton",
    name: "St Anton",
    country: "Austria",
    region: "Tyrol",
    location: "",
    altitude_base_m: 1304,
    altitude_top_m: 2811,
    car_free_town: false,
    style: "traditional",
    snow_sure_score: 4,
    total_km_piste: 301,
    blue_runs: 14,
    red_runs: 41,
    black_runs: 30,
    beginner_area: false,
    snow_park: true,
    off_piste: true,
    disability_access: true,
    olympic_history: false,
    olympic_detail: null,
    embedding: null,
    last_updated: "2024-01-01",
    created_at: "2024-01-01",
    hero_image: "https://example.com/st-anton.jpg",
  },
  {
    id: "verbier",
    name: "Verbier",
    country: "Switzerland",
    region: "Valais",
    location: "",
    altitude_base_m: 1500,
    altitude_top_m: 3330,
    car_free_town: false,
    style: "modern",
    snow_sure_score: 4,
    total_km_piste: 412,
    blue_runs: 100,
    red_runs: 120,
    black_runs: 60,
    beginner_area: false,
    snow_park: true,
    off_piste: true,
    disability_access: true,
    olympic_history: false,
    olympic_detail: null,
    embedding: null,
    last_updated: "2024-01-01",
    created_at: "2024-01-01",
    hero_image: "https://example.com/verbier.jpg",
  },
  {
    id: "grandvalira",
    name: "Grandvalira",
    country: "Andorra",
    region: "Encamp",
    location: "",
    altitude_base_m: 1710,
    altitude_top_m: 2640,
    car_free_town: false,
    style: "modern",
    snow_sure_score: 3,
    total_km_piste: 215,
    blue_runs: 33,
    red_runs: 55,
    black_runs: 22,
    beginner_area: true,
    snow_park: true,
    off_piste: false,
    disability_access: true,
    olympic_history: false,
    olympic_detail: null,
    embedding: null,
    last_updated: "2024-01-01",
    created_at: "2024-01-01",
    hero_image: null,
  },
  {
    id: "cortina",
    name: "Cortina d'Ampezzo",
    country: "Italy",
    region: "Veneto",
    location: "",
    altitude_base_m: 1224,
    altitude_top_m: 2828,
    car_free_town: false,
    style: "traditional",
    snow_sure_score: 3,
    total_km_piste: 120,
    blue_runs: 13,
    red_runs: 25,
    black_runs: 14,
    beginner_area: true,
    snow_park: false,
    off_piste: false,
    disability_access: true,
    olympic_history: true,
    olympic_detail: "1956 Winter Olympics",
    embedding: null,
    last_updated: "2024-01-01",
    created_at: "2024-01-01",
    hero_image: null,
  },
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
    single: () => Promise.resolve({ data: builder._rows[0] ?? null, error: null }),
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
    return makeBuilder([]);
  },
};

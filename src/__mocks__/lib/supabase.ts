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
  region: string | null;
  location: string | null;
  altitude_base_m: number | null;
  altitude_top_m: number | null;
  car_free_town: boolean | null;
  style: string | null;
  snow_sure_score: number | null;
  snow_sure_rating: number | null;
  total_km_piste: number | null;
  blue_runs: number | null;
  red_runs: number | null;
  black_runs: number | null;
  beginner_area: boolean | null;
  snow_park: boolean | null;
  off_piste: boolean | null;
  off_piste_score: number | null;
  backcountry_access: boolean | null;
  guide_required: boolean | null;
  freeride_world_tour: boolean | null;
  off_piste_areas: string | null;
  disability_access: boolean | null;
  wheelchair_accessible: boolean | null;
  adaptive_ski_school: boolean | null;
  accessibility_notes: string | null;
  olympic_history: boolean | null;
  olympic_detail: string | null;
  apres_ski_rating: number | null;
  apres_ski_notes: string | null;
  train_accessible: boolean | null;
  eurostar_direct: boolean | null;
  train_journey_hours: number | null;
  train_route_summary: string | null;
  drive_hours_from_london: number | null;
  sustainability_score: number | null;
  sustainability_notes: string | null;
  heli_skiing_available: boolean | null;
  heli_skiing_legal: string | null;
  heli_skiing_cost_gbp: number | null;
  night_skiing_available: boolean | null;
  night_skiing_km: number | null;
  night_skiing_days: string | null;
  snowmaking_cannon_count: number | null;
  snowmaking_coverage_pct: number | null;
  snowmaking_reliability: number | null;
  glacier_skiing: boolean | null;
  min_altitude_m: number | null;
  max_altitude_m: number | null;
  webcam_url: string | null;
  snow_report_url: string | null;
  embedding: unknown;
  last_updated: string | null;
  created_at: string | null;
  hero_image: string | null;
  // Embedded related tables
  cost_data: Array<{
    lift_pass_daily_gbp: number | null;
    lift_pass_weekly_gbp: number | null;
    mountain_lunch_gbp: number | null;
    beer_on_mountain_gbp: number | null;
    ski_rental_daily_gbp: number | null;
    ski_school_half_day_gbp: number | null;
    overall_cost_index: number | null;
    year: number;
  }> | null;
  slope_data: Array<{
    total_km: number | null;
    blue_km: number | null;
    red_km: number | null;
    black_km: number | null;
    lifts_total: number | null;
    gondolas: number | null;
    chairlifts: number | null;
    snow_park: boolean | null;
    half_pipe: boolean | null;
    mogul_field: boolean | null;
    off_piste_guided: boolean | null;
    snow_park_features: number | null;
  }> | null;
  season_timing: Array<{
    season_open: string | null;
    season_close: string | null;
    best_weeks: string | null;
    avoid_weeks: string | null;
    good_christmas: boolean | null;
    good_late_season: boolean | null;
    good_long_weekend: boolean | null;
    school_hols_busy: string | null;
  }> | null;
  airport_link: Array<{
    iata_code: string;
    airport_name: string | null;
    transfer_mins: number | null;
    direct_flights_available: boolean | null;
    shuttle_available: boolean | null;
    uk_departure_airports: string | null;
    flight_time_mins: number | null;
    seasonal_only: boolean | null;
  }> | null;
  facility: Array<{
    type: string | null;
    name: string | null;
    veggie_options: boolean | null;
    vegan_options: boolean | null;
    avg_price_gbp: number | null;
    rating: number | null;
    ski_to_door: boolean | null;
    review_count: number | null;
    english_speaking: boolean | null;
    kids_lessons: boolean | null;
    private_available: boolean | null;
    instructor_notes: string | null;
    whiteout_activity: boolean | null;
    apres_ski: boolean | null;
    nightlife_level: number | null;
  }> | null;
  accommodation: Array<{
    type: string | null;
    name: string | null;
    stars: number | null;
    ski_in_out: boolean | null;
    kids_club: boolean | null;
    price_per_night_gbp: number | null;
    min_nights: number | null;
    catered: boolean | null;
    booking_url: string | null;
  }> | null;
  weather_month: Array<{
    month: number;
    avg_temp_c: number | null;
    avg_wind_kph: number | null;
    wind_chill_c: number | null;
    avg_bluebird_days: number | null;
    avg_snowfall_cm: number | null;
    snow_depth_cm: number | null;
    visibility_score: number | null;
  }> | null;
}

/** Shared nullable defaults so each fixture only needs to override meaningful fields */
const BASE: Omit<MockResortRow, "id" | "name" | "country"> = {
  region: null,
  location: null,
  altitude_base_m: null,
  altitude_top_m: null,
  car_free_town: false,
  style: "traditional",
  snow_sure_score: 3,
  snow_sure_rating: null,
  total_km_piste: 0,
  blue_runs: 0,
  red_runs: 0,
  black_runs: 0,
  beginner_area: false,
  snow_park: false,
  off_piste: false,
  off_piste_score: null,
  backcountry_access: false,
  guide_required: false,
  freeride_world_tour: false,
  off_piste_areas: null,
  disability_access: false,
  wheelchair_accessible: false,
  adaptive_ski_school: false,
  accessibility_notes: null,
  olympic_history: false,
  olympic_detail: null,
  apres_ski_rating: 3,
  apres_ski_notes: null,
  train_accessible: false,
  eurostar_direct: false,
  train_journey_hours: null,
  train_route_summary: null,
  drive_hours_from_london: null,
  sustainability_score: null,
  sustainability_notes: null,
  heli_skiing_available: false,
  heli_skiing_legal: null,
  heli_skiing_cost_gbp: null,
  night_skiing_available: false,
  night_skiing_km: null,
  night_skiing_days: null,
  snowmaking_cannon_count: null,
  snowmaking_coverage_pct: null,
  snowmaking_reliability: null,
  glacier_skiing: false,
  min_altitude_m: null,
  max_altitude_m: null,
  webcam_url: null,
  snow_report_url: null,
  embedding: null,
  last_updated: "2024-01-01",
  created_at: "2024-01-01",
  hero_image: null,
  // Nested related tables
  cost_data: null,
  slope_data: null,
  season_timing: null,
  airport_link: null,
  facility: null,
  accommodation: null,
  weather_month: null,
};

const MOCK_RESORTS: MockResortRow[] = [
  {
    ...BASE,
    id: "val-thorens",
    name: "Val Thorens",
    country: "France",
    region: "Savoie",
    altitude_base_m: 2300,
    altitude_top_m: 3230,
    car_free_town: true,
    style: "modern",
    snow_sure_score: 5,
    snow_sure_rating: 5,
    glacier_skiing: true,
    total_km_piste: 600,
    blue_runs: 30,
    red_runs: 60,
    black_runs: 30,
    beginner_area: true,
    snow_park: true,
    apres_ski_rating: 4,
    hero_image: "https://example.com/val-thorens.jpg",
    cost_data: [
      {
        lift_pass_daily_gbp: 58,
        lift_pass_weekly_gbp: 290,
        mountain_lunch_gbp: 22,
        beer_on_mountain_gbp: 7,
        ski_rental_daily_gbp: 35,
        ski_school_half_day_gbp: 80,
        overall_cost_index: 4,
        year: 2025,
      },
    ],
    slope_data: [
      {
        total_km: 600,
        blue_km: 150,
        red_km: 300,
        black_km: 150,
        lifts_total: 156,
        gondolas: 12,
        chairlifts: 44,
        snow_park: true,
        half_pipe: true,
        mogul_field: false,
        off_piste_guided: false,
        snow_park_features: 40,
      },
    ],
    season_timing: [
      {
        season_open: "2025-11-22",
        season_close: "2026-05-03",
        best_weeks: "Jan, Feb",
        avoid_weeks: "Feb half-term",
        good_christmas: true,
        good_late_season: true,
        good_long_weekend: false,
        school_hols_busy: "UK Feb half-term",
      },
    ],
    airport_link: [
      {
        iata_code: "GVA",
        airport_name: "Geneva Airport",
        transfer_mins: 150,
        direct_flights_available: true,
        shuttle_available: true,
        uk_departure_airports: "LHR,LGW,MAN",
        flight_time_mins: 90,
        seasonal_only: false,
      },
    ],
    facility: [
      {
        type: "bar",
        name: "La Folie Douce",
        veggie_options: true,
        vegan_options: false,
        avg_price_gbp: 12,
        rating: 4.5,
        ski_to_door: true,
        review_count: 320,
        english_speaking: true,
        kids_lessons: false,
        private_available: false,
        instructor_notes: null,
        whiteout_activity: false,
        apres_ski: true,
        nightlife_level: 5,
      },
      {
        type: "bar",
        name: "Le Rhododendron",
        veggie_options: false,
        vegan_options: false,
        avg_price_gbp: 10,
        rating: 4.0,
        ski_to_door: false,
        review_count: 180,
        english_speaking: true,
        kids_lessons: false,
        private_available: false,
        instructor_notes: null,
        whiteout_activity: false,
        apres_ski: true,
        nightlife_level: 4,
      },
      {
        type: "ski_school",
        name: "ESF Val Thorens",
        veggie_options: null,
        vegan_options: null,
        avg_price_gbp: 80,
        rating: 4.2,
        ski_to_door: false,
        review_count: 210,
        english_speaking: true,
        kids_lessons: true,
        private_available: true,
        instructor_notes: null,
        whiteout_activity: false,
        apres_ski: false,
        nightlife_level: null,
      },
      {
        type: "activity",
        name: "Indoor climbing wall",
        veggie_options: null,
        vegan_options: null,
        avg_price_gbp: 15,
        rating: 3.8,
        ski_to_door: false,
        review_count: 45,
        english_speaking: true,
        kids_lessons: false,
        private_available: false,
        instructor_notes: null,
        whiteout_activity: true,
        apres_ski: false,
        nightlife_level: null,
      },
    ],
    accommodation: [
      {
        type: "hotel",
        name: "Hôtel Fitz Roy",
        stars: 4,
        ski_in_out: true,
        kids_club: true,
        price_per_night_gbp: 280,
        min_nights: 2,
        catered: false,
        booking_url: null,
      },
      {
        type: "chalet",
        name: "Chalet Soleil",
        stars: null,
        ski_in_out: false,
        kids_club: false,
        price_per_night_gbp: 150,
        min_nights: 7,
        catered: true,
        booking_url: null,
      },
    ],
    weather_month: [
      {
        month: 12,
        avg_temp_c: -5,
        avg_wind_kph: 22,
        wind_chill_c: -12,
        avg_bluebird_days: 12,
        avg_snowfall_cm: 65,
        snow_depth_cm: 120,
        visibility_score: 4,
      },
      {
        month: 1,
        avg_temp_c: -8,
        avg_wind_kph: 18,
        wind_chill_c: -15,
        avg_bluebird_days: 14,
        avg_snowfall_cm: 80,
        snow_depth_cm: 180,
        visibility_score: 4,
      },
      {
        month: 2,
        avg_temp_c: -6,
        avg_wind_kph: 20,
        wind_chill_c: -13,
        avg_bluebird_days: 13,
        avg_snowfall_cm: 70,
        snow_depth_cm: 200,
        visibility_score: 5,
      },
      {
        month: 3,
        avg_temp_c: -3,
        avg_wind_kph: 15,
        wind_chill_c: -9,
        avg_bluebird_days: 15,
        avg_snowfall_cm: 55,
        snow_depth_cm: 210,
        visibility_score: 5,
      },
    ],
  },
  {
    ...BASE,
    id: "chamonix",
    name: "Chamonix",
    country: "France",
    region: "Haute-Savoie",
    altitude_base_m: 1035,
    altitude_top_m: 3842,
    style: "traditional",
    snow_sure_score: 4,
    total_km_piste: 152,
    blue_runs: 10,
    red_runs: 25,
    black_runs: 35,
    off_piste: true,
    off_piste_score: 5,
    freeride_world_tour: true,
    backcountry_access: true,
    disability_access: true,
    olympic_history: true,
    olympic_detail: "1924 Winter Olympics",
    apres_ski_rating: 4,
    hero_image: "https://example.com/chamonix.jpg",
  },
  {
    ...BASE,
    id: "st-anton",
    name: "St Anton",
    country: "Austria",
    region: "Tyrol",
    altitude_base_m: 1304,
    altitude_top_m: 2811,
    style: "traditional",
    snow_sure_score: 4,
    total_km_piste: 301,
    blue_runs: 14,
    red_runs: 41,
    black_runs: 30,
    snow_park: true,
    off_piste: true,
    off_piste_score: 4,
    disability_access: true,
    apres_ski_rating: 5,
    night_skiing_available: true,
    night_skiing_km: 4,
    hero_image: "https://example.com/st-anton.jpg",
  },
  {
    ...BASE,
    id: "verbier",
    name: "Verbier",
    country: "Switzerland",
    region: "Valais",
    altitude_base_m: 1500,
    altitude_top_m: 3330,
    style: "modern",
    snow_sure_score: 4,
    total_km_piste: 412,
    blue_runs: 100,
    red_runs: 120,
    black_runs: 60,
    snow_park: true,
    off_piste: true,
    off_piste_score: 5,
    heli_skiing_available: true,
    freeride_world_tour: true,
    disability_access: true,
    apres_ski_rating: 5,
    hero_image: "https://example.com/verbier.jpg",
  },
  {
    ...BASE,
    id: "grandvalira",
    name: "Grandvalira",
    country: "Andorra",
    region: "Encamp",
    altitude_base_m: 1710,
    altitude_top_m: 2640,
    style: "modern",
    snow_sure_score: 3,
    total_km_piste: 215,
    blue_runs: 33,
    red_runs: 55,
    black_runs: 22,
    beginner_area: true,
    snow_park: true,
    adaptive_ski_school: true,
    disability_access: true,
    apres_ski_rating: 3,
  },
  {
    ...BASE,
    id: "cortina",
    name: "Cortina d'Ampezzo",
    country: "Italy",
    region: "Veneto",
    altitude_base_m: 1224,
    altitude_top_m: 2828,
    style: "traditional",
    snow_sure_score: 3,
    total_km_piste: 120,
    blue_runs: 13,
    red_runs: 25,
    black_runs: 14,
    beginner_area: true,
    disability_access: true,
    olympic_history: true,
    olympic_detail: "1956 Winter Olympics",
    apres_ski_rating: 3,
    train_accessible: true,
    train_journey_hours: 5,
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
    return makeBuilder([]);
  },
};

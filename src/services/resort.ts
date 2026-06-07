import { supabase, isSupabaseConfigured } from "@lib/supabase";
import type { Resort, AccommodationOption, FacilityOption } from "@/types/resort";
import { getResortHeroImage } from "@/data/resortImages";
import { getResortNearestAirport } from "@/data/resortNearestAirports";

// ─────────────────────────────────────────────────────────────────────────────
// Continent classification from country name
// ─────────────────────────────────────────────────────────────────────────────

const CONTINENT_MAP: Record<string, Resort["continent"]> = {
  // Europe
  France: "Europe",
  Austria: "Europe",
  Switzerland: "Europe",
  Italy: "Europe",
  Germany: "Europe",
  Spain: "Europe",
  Andorra: "Europe",
  Norway: "Europe",
  Sweden: "Europe",
  Finland: "Europe",
  Bulgaria: "Europe",
  Romania: "Europe",
  Slovenia: "Europe",
  Slovakia: "Europe",
  "Czech Republic": "Europe",
  Poland: "Europe",
  Scotland: "Europe",
  "United Kingdom": "Europe",
  Greece: "Europe",
  Turkey: "Europe",
  Georgia: "Europe",
  Montenegro: "Europe",
  "Bosnia and Herzegovina": "Europe",
  Serbia: "Europe",
  Croatia: "Europe",
  Iceland: "Europe",
  Liechtenstein: "Europe",
  // North America
  "United States": "North America",
  Canada: "North America",
  // South America
  Argentina: "South America",
  Chile: "South America",
  // Asia
  Japan: "Asia",
  "South Korea": "Asia",
  China: "Asia",
  India: "Asia",
  Iran: "Asia",
  Lebanon: "Asia",
  Kazakhstan: "Asia",
  // Oceania
  Australia: "Oceania",
  "New Zealand": "Oceania",
};

function getContinent(country: string): Resort["continent"] {
  return CONTINENT_MAP[country] ?? "Europe";
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase row → Resort mapper (flat columns)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shape returned by `select("*")` on the `resort` table.
 * The DB uses a flat schema with individual columns rather than JSONB.
 */
interface SupabaseResortRow {
  id: string;
  name: string;
  country: string;
  region: string | null;
  continent: string | null;
  // Location
  lat: number | null;
  lng: number | null;
  min_altitude_m: number | null;
  max_altitude_m: number | null;
  altitude_base_m: number | null;
  altitude_top_m: number | null;
  // Terrain / runs
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
  // Snow
  snow_sure_score: number | null;
  snow_sure_rating: number | null;
  glacier_skiing: boolean | null;
  snowmaking_cannon_count: number | null;
  snowmaking_coverage_pct: number | null;
  snowmaking_km_covered: number | null;
  snowmaking_reliability: number | null;
  snowmaking_notes: string | null;
  // Transport
  train_accessible: boolean | null;
  eurostar_direct: boolean | null;
  train_journey_hours: number | null;
  train_route_summary: string | null;
  drive_hours_from_london: number | null;
  // Sustainability & accessibility
  sustainability_score: number | null;
  sustainability_notes: string | null;
  wheelchair_accessible: boolean | null;
  adaptive_ski_school: boolean | null;
  accessibility_notes: string | null;
  // Après-ski
  apres_ski_rating: number | null;
  apres_ski_notes: string | null;
  // Night skiing
  night_skiing_available: boolean | null;
  night_skiing_pistes: number | null;
  night_skiing_km: number | null;
  night_skiing_days: string | null;
  night_skiing_until: string | null;
  night_skiing_cost_gbp: number | null;
  night_skiing_notes: string | null;
  // Heli skiing
  heli_skiing_available: boolean | null;
  heli_skiing_legal: string | null;
  heli_skiing_notes: string | null;
  heli_skiing_operator: string | null;
  heli_skiing_cost_gbp: number | null;
  // Assets / links
  hero_image: string | null;
  webcam_url: string | null;
  snow_report_url: string | null;
  // Style / misc
  style: string | null;
  car_free_town: boolean | null;
  disability_access: boolean | null;
  olympic_history: boolean | null;
  olympic_detail: string | null;
  // Meta
  location: unknown; // PostGIS point (unused — lat/lng are separate columns)
  embedding: unknown;
  created_at: string;
  last_updated: string | null;
}

/** Shape of a row from the `cost_data` table. */
interface CostDataRow {
  resort_id: string;
  lift_pass_daily_gbp: number | null;
  lift_pass_weekly_gbp: number | null;
  mountain_lunch_gbp: number | null;
  ski_rental_daily_gbp: number | null;
  overall_cost_index: number | null;
}

/** Shape of a row from the `slope_data` table. */
interface SlopeDataRow {
  resort_id: string;
  lifts_total: number | null;
  gondolas: number | null;
  chairlifts: number | null;
  snow_park: boolean | null;
  half_pipe: boolean | null;
}

/** Shape of a row from the `season_timing` table. */
interface SeasonTimingRow {
  resort_id: string;
  season_open: string | null;
  season_close: string | null;
}

/** Shape of a row from the `airport_link` table. */
interface AirportLinkRow {
  resort_id: string;
  iata_code: string;
  airport_name: string | null;
  transfer_mins: number | null;
  direct_flights_available: boolean | null;
}

/** Shape of a row from the `accommodation` table (aggregated). */
interface AccommodationAggRow {
  resort_id: string;
  has_ski_in_out: boolean;
  has_catered: boolean;
  has_kids_club: boolean;
}

/** Shape of a raw accommodation row for detailed listings. */
interface AccommodationDetailRow {
  resort_id: string;
  type: string;
  name: string;
  stars: number | null;
  ski_in_out: boolean | null;
  kids_club: boolean | null;
  price_per_night_gbp: number | null;
  catered: boolean | null;
}

/** Shape of a row from the `facility` table (aggregated bar/nightlife counts). */
interface FacilityAggRow {
  resort_id: string;
  bar_count: number;
  restaurant_count: number;
  has_pool: boolean;
  has_spa: boolean;
  max_nightlife_level: number | null;
}

/** Shape of a raw facility row for detailed listings. */
interface FacilityDetailRow {
  resort_id: string;
  type: string;
  name: string;
  rating: number | null;
  avg_price_gbp: number | null;
  whiteout_activity: boolean | null;
  apres_ski: boolean | null;
}

/** Shape of a row from the `resort_content` table. */
interface ResortContentRow {
  resort_id: string;
  field_key: string;
  plain_english_value: string | null;
}

/** Shape of a row from the `weather_month` table. */
interface WeatherMonthRow {
  resort_id: string;
  month: number;
  avg_temp_c: number | null;
  avg_snowfall_cm: number | null;
  avg_bluebird_days: number | null;
  avg_wind_kph: number | null;
}

/** Lookup maps keyed by resort_id for supplementary data. */
interface SupplementaryData {
  costs: Map<string, CostDataRow>;
  slopes: Map<string, SlopeDataRow>;
  seasons: Map<string, SeasonTimingRow>;
  airports: Map<string, AirportLinkRow[]>;
  accommodation: Map<string, AccommodationAggRow>;
  facilities: Map<string, FacilityAggRow>;
  accommodationDetail: Map<string, AccommodationDetailRow[]>;
  facilityDetail: Map<string, FacilityDetailRow[]>;
  content: Map<string, Map<string, string>>;
  weather: Map<string, WeatherMonthRow[]>;
}

/**
 * Compute the current or upcoming European ski season window.
 * Seasons run roughly Dec 1 → Apr 30. If we're in the off-season
 * (May–Nov), return the next upcoming season so the seasonal penalty
 * never fires incorrectly due to missing real data.
 *
 * @returns An object with ISO date strings for `start` and `end`.
 */
function getCurrentSeason(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // May (4) through November (10) → return next season
  if (month >= 4 && month <= 10) {
    return {
      start: `${year}-12-01`,
      end: `${year + 1}-04-30`,
    };
  }
  // Dec (11) → current season spans into next year
  if (month === 11) {
    return {
      start: `${year}-12-01`,
      end: `${year + 1}-04-30`,
    };
  }
  // Jan (0) through Apr (3) → current season started last Dec
  return {
    start: `${year - 1}-12-01`,
    end: `${year}-04-30`,
  };
}

/**
 * Convert a Supabase resort row (flat columns) to the app Resort type.
 * Merges data from supplementary tables (cost_data, slope_data, season_timing).
 */
function supabaseRowToResort(
  row: SupabaseResortRow,
  supplementary?: SupplementaryData,
): Resort {
  const localAirport = getResortNearestAirport(row.name);

  // Calculate terrain percentages from run counts
  const blue = row.blue_runs ?? 0;
  const red = row.red_runs ?? 0;
  const black = row.black_runs ?? 0;
  const totalRuns = blue + red + black;
  const begPct = totalRuns > 0 ? Math.round((blue / totalRuns) * 100) : 33;
  const intPct = totalRuns > 0 ? Math.round((red / totalRuns) * 100) : 34;
  const advPct = totalRuns > 0 ? 100 - begPct - intPct : 33;

  // Supplementary data lookups
  const cost = supplementary?.costs.get(row.id);
  const slope = supplementary?.slopes.get(row.id);
  const season = supplementary?.seasons.get(row.id);
  const airportLinks = supplementary?.airports.get(row.id);
  const accom = supplementary?.accommodation.get(row.id);
  const facility = supplementary?.facilities.get(row.id);
  const resortContent = supplementary?.content.get(row.id);
  const weatherData = supplementary?.weather.get(row.id);

  // Compute average daily cost from real cost components (GBP)
  const liftPassDaily = cost?.lift_pass_daily_gbp ?? 60;
  const lunchCost = cost?.mountain_lunch_gbp ?? 20;
  const rentalCost = cost?.ski_rental_daily_gbp ?? 30;
  const computedDailyCost = Math.round(liftPassDaily + lunchCost + rentalCost);

  // Derive crowd level from cost index (1-5) — expensive/famous resorts tend to be busier
  // combined with après-ski rating as a proxy for how lively/popular the resort is
  const costIndex = cost?.overall_cost_index ?? 3;
  const apresRating = row.apres_ski_rating ?? 3;
  const crowdEstimate = Math.min(5, Math.max(1, Math.round((costIndex + apresRating) / 2))) as 1 | 2 | 3 | 4 | 5;

  // Pick nearest airport from airport_link (shortest transfer time)
  const closestAirport = airportLinks?.length
    ? airportLinks.reduce((best, cur) =>
        (cur.transfer_mins ?? 999) < (best.transfer_mins ?? 999) ? cur : best
      )
    : null;

  // Lift modernity: ratio of gondolas to total lifts (more gondolas = more modern)
  const totalLifts = slope?.lifts_total ?? 0;
  const gondolaCount = slope?.gondolas ?? 0;
  const modernityRatio = totalLifts > 0 ? gondolaCount / totalLifts : 0;
  const liftModernity = Math.min(5, Math.max(1, Math.round(modernityRatio * 10 + 1))) as 1 | 2 | 3 | 4 | 5;

  // Family score: beginner area + kids club + pool
  const familyBase = row.beginner_area ? 2 : 0;
  const familyKids = accom?.has_kids_club ? 1 : 0;
  const familyPool = facility?.has_pool ? 1 : 0;
  const familyRaw = Math.min(5, familyBase + familyKids + familyPool + 1);

  // Bar count from facility data — treat 0 as missing data (stored as 0 in DB
  // when count was never entered), fall back to estimate from apres rating.
  const barCount =
    facility?.bar_count != null && facility.bar_count > 0
      ? facility.bar_count
      : apresRating * 2;

  // Auto-generate highlight chips from real resort data (max 4)
  const highlights: string[] = [];
  const peakAlt = row.max_altitude_m ?? row.altitude_top_m ?? 0;
  const snowRel = row.snow_sure_rating ?? 3;
  if (peakAlt >= 3000) highlights.push("Glacier skiing");
  else if (peakAlt >= 2500) highlights.push("High-altitude snowsure");
  if (snowRel >= 4) highlights.push("Snow-sure resort");
  if (apresRating >= 4) highlights.push("Lively après-ski");
  if (advPct >= 35) highlights.push("Expert off-piste terrain");
  else if (begPct >= 35) highlights.push("Beginner-friendly");
  if (row.eurostar_direct) highlights.push("Eurostar direct from London");
  else if (row.train_accessible) highlights.push("Train accessible");
  if (accom?.has_kids_club) highlights.push("Kids club on-site");
  if (accom?.has_ski_in_out) highlights.push("Ski-in/ski-out options");
  const dailyCostForHighlights = Math.round(
    (cost?.lift_pass_daily_gbp ?? 60) +
    (cost?.mountain_lunch_gbp ?? 20) +
    (cost?.ski_rental_daily_gbp ?? 30)
  );
  if (dailyCostForHighlights < 130) highlights.push("Budget-friendly");

  // Build other activities from facility flags
  const activities: string[] = [];
  if (facility?.has_pool) activities.push("Swimming pool");
  if (facility?.has_spa) activities.push("Spa & wellness");
  if (row.snow_park) activities.push("Snow park");
  if (row.off_piste) activities.push("Off-piste skiing");
  if (row.night_skiing_available) activities.push("Night skiing");

  return {
    id: row.id,
    name: row.name,
    country: row.country,
    region: row.region ?? row.country,
    subRegion: undefined,
    continent: (row.continent as Resort["continent"]) ?? getContinent(row.country),
    location: {
      lat: row.lat ?? 0,
      lng: row.lng ?? 0,
      villageAltitude: row.min_altitude_m ?? row.altitude_base_m ?? 0,
      peakAltitude: row.max_altitude_m ?? row.altitude_top_m ?? 0,
    },
    terrain: {
      beginner: begPct,
      intermediate: intPct,
      advanced: advPct,
    },
    stats: {
      totalRuns,
      totalKm: row.total_km_piste ?? 0,
      lifts: slope?.lifts_total ?? 0,
      snowParks: (slope?.snow_park ?? row.snow_park) ? 1 : 0,
    },
    attributes: {
      averageDailyCost: computedDailyCost,
      liftPassDayCost: liftPassDaily,
      liftPassSixDayCost: cost?.lift_pass_weekly_gbp ?? Math.round(liftPassDaily * 5.5),
      crowdLevel: crowdEstimate,
      familyScore: familyRaw as 1 | 2 | 3 | 4 | 5,
      nightlifeScore: (row.apres_ski_rating ?? 3) as 1 | 2 | 3 | 4 | 5,
      snowReliability: (row.snow_sure_rating ?? 3) as 1 | 2 | 3 | 4 | 5,
      liftModernity,
      nearestAirport: closestAirport?.iata_code ?? localAirport.iata,
      transferTimeMinutes: closestAirport?.transfer_mins ?? localAirport.transferTimeMinutes,
      // Derive fallback townStyle when DB row.style is null:
      // a lively après-ski rating implies a lively town rather than a quiet village.
      townStyle: (row.style ??
        (apresRating >= 4
          ? "Lively town"
          : row.car_free_town
            ? "Traditional village"
            : "Traditional village")) as Resort["attributes"]["townStyle"],
      barCount,
      otherActivities: activities,
      hasSkiInOut: accom?.has_ski_in_out ?? false,
      hasCatered: accom?.has_catered ?? false,
      hasKidsClub: accom?.has_kids_club ?? false,
      trainAccessible: row.train_accessible ?? false,
      eurostarDirect: row.eurostar_direct ?? false,
      trainJourneyHours: row.train_journey_hours ?? null,
      driveHoursFromLondon: row.drive_hours_from_london ?? null,
    },
    content: {
      description: resortContent?.get("resort_summary") ??
        `${row.name} is a ski resort in ${row.region ?? row.country}, ${row.country}.`,
      highlights: highlights.slice(0, 4),
      apresSummary: resortContent?.get("apres_summary") ?? row.apres_ski_notes ?? undefined,
      whiteoutSummary: resortContent?.get("whiteout_summary"),
      noFlySummary: resortContent?.get("no_fly_summary"),
      snowmakingSummary: resortContent?.get("snowmaking_summary"),
      offPisteSummary: resortContent?.get("off_piste_summary"),
      webcamUrl: resortContent?.get("webcam_url"),
      snowReportUrl: resortContent?.get("snow_report_url"),
    },
    assets: {
      heroImage: row.hero_image ?? getResortHeroImage(row.name),
      pisteMap: "",
    },
    season: season
      ? { start: season.season_open ?? getCurrentSeason().start, end: season.season_close ?? getCurrentSeason().end }
      : getCurrentSeason(),
    weather: weatherData?.map((w) => ({
      month: w.month,
      avgTempC: Number(w.avg_temp_c) || 0,
      avgSnowfallCm: Number(w.avg_snowfall_cm) || 0,
      avgBluebirdDays: Number(w.avg_bluebird_days) || 0,
      avgWindKph: Number(w.avg_wind_kph) || 0,
    })),
    accommodationOptions: supplementary?.accommodationDetail.get(row.id)?.map((a) => ({
      type: a.type as AccommodationOption["type"],
      name: a.name,
      stars: a.stars,
      skiInOut: a.ski_in_out ?? false,
      kidsClub: a.kids_club ?? false,
      pricePerNightGbp: a.price_per_night_gbp,
      catered: a.catered ?? false,
    })),
    facilityOptions: supplementary?.facilityDetail.get(row.id)?.map((f) => ({
      type: f.type as FacilityOption["type"],
      name: f.name,
      rating: f.rating,
      avgPriceGbp: f.avg_price_gbp,
      whiteoutActivity: f.whiteout_activity ?? false,
      apresSki: f.apres_ski ?? false,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache for cloud resorts
// ─────────────────────────────────────────────────────────────────────────────

let cachedResorts: Resort[] | null = null;
let cachedSupplementary: SupplementaryData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the resort cache (useful after uploading new data).
 */
export function clearResortCache(): void {
  cachedResorts = null;
  cachedSupplementary = null;
  cacheTimestamp = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry utility
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retry an async function with exponential backoff.
 * Returns null after all attempts are exhausted.
 */
async function fetchWithRetry<T>(
  fn: () => Promise<T | null>,
  { retries = 2, backoff = 1000 }: { retries?: number; backoff?: number } = {},
): Promise<T | null> {
  let lastResult: T | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    lastResult = await fn();
    if (lastResult !== null) return lastResult;
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, backoff * 2 ** attempt));
    }
  }
  return lastResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cloud fetch functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch supplementary data (cost, slope, season, etc.) from related tables.
 * Returns lookup maps keyed by resort_id for efficient merging.
 * Uses Promise.allSettled for graceful per-table degradation.
 */
async function fetchSupplementaryData(): Promise<SupplementaryData> {
  const empty: SupplementaryData = {
    costs: new Map(),
    slopes: new Map(),
    seasons: new Map(),
    airports: new Map(),
    accommodation: new Map(),
    facilities: new Map(),
    accommodationDetail: new Map(),
    facilityDetail: new Map(),
    content: new Map(),
    weather: new Map(),
  };

  if (!supabase || !isSupabaseConfigured) return empty;
  const client = supabase;

  const results = await Promise.allSettled([
    client
      .from("cost_data")
      .select(
        "resort_id, lift_pass_daily_gbp, lift_pass_weekly_gbp, " +
        "mountain_lunch_gbp, ski_rental_daily_gbp, overall_cost_index",
      ),
    client
      .from("slope_data")
      .select("resort_id, lifts_total, gondolas, chairlifts, snow_park, half_pipe"),
    client
      .from("season_timing")
      .select("resort_id, season_open, season_close"),
    client
      .from("airport_link")
      .select(
        "resort_id, iata_code, airport_name, transfer_mins, direct_flights_available",
      ),
    client
      .from("accommodation")
      .select("resort_id, type, name, stars, ski_in_out, kids_club, price_per_night_gbp, catered"),
    client
      .from("facility")
      .select("resort_id, type, name, rating, avg_price_gbp, whiteout_activity, apres_ski, nightlife_level"),
    client
      .from("resort_content")
      .select("resort_id, field_key, plain_english_value"),
    client
      .from("weather_month")
      .select(
        "resort_id, month, avg_temp_c, avg_snowfall_cm, avg_bluebird_days, avg_wind_kph",
      ),
  ]);

  // Extract data from settled results (null if rejected or errored)
  const getData = (idx: number) => {
    const r = results[idx];
    if (r.status === "rejected") return null;
    const val = r.value as { data: unknown[] | null; error: unknown };
    return val.error ? null : val.data;
  };

  const costData = getData(0);
  const slopeData = getData(1);
  const seasonData = getData(2);
  const airportData = getData(3);
  const accomData = getData(4);
  const facilityData = getData(5);
  const contentData = getData(6);
  const weatherData = getData(7);

  const costs = new Map<string, CostDataRow>();
  if (costData) {
    for (const row of costData as CostDataRow[]) {
      costs.set(row.resort_id, row);
    }
  }

  const slopes = new Map<string, SlopeDataRow>();
  if (slopeData) {
    for (const row of slopeData as SlopeDataRow[]) {
      slopes.set(row.resort_id, row);
    }
  }

  const seasons = new Map<string, SeasonTimingRow>();
  if (seasonData) {
    for (const row of seasonData as SeasonTimingRow[]) {
      seasons.set(row.resort_id, row);
    }
  }

  // Airport links — multiple per resort, pick closest transfer
  const airports = new Map<string, AirportLinkRow[]>();
  if (airportData) {
    for (const row of airportData as AirportLinkRow[]) {
      const existing = airports.get(row.resort_id) ?? [];
      existing.push(row);
      airports.set(row.resort_id, existing);
    }
  }

  // Accommodation flags — aggregate client-side + build detail list
  const accommodation = new Map<string, AccommodationAggRow>();
  const accommodationDetail = new Map<string, AccommodationDetailRow[]>();
  if (accomData) {
    const agg = new Map<string, { skiInOut: boolean; catered: boolean; kidsClub: boolean }>();
    for (const row of accomData as AccommodationDetailRow[]) {
      const cur = agg.get(row.resort_id) ?? { skiInOut: false, catered: false, kidsClub: false };
      if (row.ski_in_out) cur.skiInOut = true;
      if (row.catered) cur.catered = true;
      if (row.kids_club) cur.kidsClub = true;
      agg.set(row.resort_id, cur);

      // Build detail list
      const existing = accommodationDetail.get(row.resort_id) ?? [];
      existing.push(row);
      accommodationDetail.set(row.resort_id, existing);
    }
    for (const [id, flags] of agg) {
      accommodation.set(id, {
        resort_id: id,
        has_ski_in_out: flags.skiInOut,
        has_catered: flags.catered,
        has_kids_club: flags.kidsClub,
      });
    }
  }

  // Facility aggregates — aggregate client-side + build detail list
  const facilities = new Map<string, FacilityAggRow>();
  const facilityDetail = new Map<string, FacilityDetailRow[]>();
  if (facilityData) {
    const agg = new Map<string, {
      bars: number; restaurants: number;
      pool: boolean; spa: boolean; maxNightlife: number | null;
    }>();
    for (const row of facilityData as (FacilityDetailRow & { nightlife_level: number | null })[]) {
      const cur = agg.get(row.resort_id) ?? {
        bars: 0, restaurants: 0, pool: false, spa: false, maxNightlife: null,
      };
      if (row.type === "bar") cur.bars++;
      if (row.type === "restaurant") cur.restaurants++;
      if (row.type === "pool") cur.pool = true;
      if (row.type === "spa") cur.spa = true;
      if (
        row.nightlife_level != null &&
        (cur.maxNightlife == null || row.nightlife_level > cur.maxNightlife)
      ) {
        cur.maxNightlife = row.nightlife_level;
      }
      agg.set(row.resort_id, cur);

      // Build detail list
      const existing = facilityDetail.get(row.resort_id) ?? [];
      existing.push(row);
      facilityDetail.set(row.resort_id, existing);
    }
    for (const [id, data] of agg) {
      facilities.set(id, {
        resort_id: id,
        bar_count: data.bars,
        restaurant_count: data.restaurants,
        has_pool: data.pool,
        has_spa: data.spa,
        max_nightlife_level: data.maxNightlife,
      });
    }
  }

  // Resort content — key-value pairs per resort
  const contentMap = new Map<string, Map<string, string>>();
  if (contentData) {
    for (const row of contentData as ResortContentRow[]) {
      if (!row.plain_english_value) continue;
      let resortMap = contentMap.get(row.resort_id);
      if (!resortMap) {
        resortMap = new Map();
        contentMap.set(row.resort_id, resortMap);
      }
      resortMap.set(row.field_key, row.plain_english_value);
    }
  }

  // Weather — multiple months per resort
  const weather = new Map<string, WeatherMonthRow[]>();
  if (weatherData) {
    for (const row of weatherData as WeatherMonthRow[]) {
      const existing = weather.get(row.resort_id) ?? [];
      existing.push(row);
      weather.set(row.resort_id, existing);
    }
  }

  return {
    costs, slopes, seasons, airports,
    accommodation, facilities, accommodationDetail, facilityDetail,
    content: contentMap, weather,
  };
}

/**
 * Fetch all resorts from Supabase.
 * Returns null if fetch fails or Supabase not configured.
 */
async function fetchCloudResorts(): Promise<Resort[] | null> {
  if (!supabase || !isSupabaseConfigured) {
    return cachedResorts;
  }
  const client = supabase;

  // Return cached data if it's still fresh
  if (cachedResorts && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedResorts;
  }

  // Use Promise.race for a reliable cross-environment timeout.
  // Wrap builder in a native Promise first — Hermes (React Native JS engine)
  // does not reliably adopt custom thenables in Promise.race.
  type FetchResult = {
    data: unknown[] | null;
    error: { message: string } | null;
  };
  const fetchPromise = new Promise<FetchResult>((resolve, reject) => {
    (
      client
        .from("resort")
        .select("*")
        .order("name") as unknown as PromiseLike<FetchResult>
    ).then(resolve, reject);
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Resort fetch timed out")), 8000),
  );

  try {
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to fetch resorts from Supabase:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Fetch supplementary data (costs, lifts, seasons) in parallel
    const supplementary = await fetchSupplementaryData();
    cachedSupplementary = supplementary;

    cachedResorts = (data as SupabaseResortRow[]).map((row) =>
      supabaseRowToResort(row, supplementary),
    );
    cacheTimestamp = Date.now();
    return cachedResorts;
  } catch (e: unknown) {
    // eslint-disable-next-line no-console
    console.warn(
      "Error fetching cloud resorts:",
      e instanceof Error ? e.message : e,
    );
    return null;
  }
}

/**
 * Fetch a single resort by ID from Supabase.
 */
async function fetchCloudResortById(id: string): Promise<Resort | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  // Check cache first
  if (cachedResorts) {
    const cached = cachedResorts.find((r) => r.id === id);
    if (cached) return cached;
  }

  try {
    const { data, error } = await supabase
      .from("resort")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    const supplementary = cachedSupplementary ?? await fetchSupplementaryData();
    return supabaseRowToResort(data as SupabaseResortRow, supplementary);
  } catch (_e: unknown) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API (cloud-only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all resorts from Supabase.
 * Retries with exponential backoff on cold-start failure (no cached data).
 * Returns empty array only if all attempts fail.
 */
export async function getAllResortsAsync(): Promise<Resort[]> {
  const cloudResorts = await fetchCloudResorts();
  if (cloudResorts) return cloudResorts;

  // If cache already has data, return it (stale-while-revalidate)
  if (cachedResorts) return cachedResorts;

  // Cold start: no cache and fetch failed — retry with backoff
  const retry = await fetchWithRetry(fetchCloudResorts, {
    retries: 2,
    backoff: 1000,
  });
  return retry ?? [];
}

/**
 * Get all resorts (synchronous, cached data only).
 * Returns empty array if cache is not populated.
 * Call preloadResorts() first to populate cache.
 */
export function getAllResorts(): Resort[] {
  return cachedResorts ?? [];
}

/**
 * Get a resort by ID from Supabase.
 */
export async function getResortByIdAsync(
  id: string,
): Promise<Resort | undefined> {
  const cloudResort = await fetchCloudResortById(id);
  return cloudResort ?? undefined;
}

/**
 * Get a resort by ID (synchronous, cached data only).
 */
export function getResortById(id: string): Resort | undefined {
  return cachedResorts?.find((r) => r.id === id);
}

/**
 * Get resorts filtered by region.
 */
export function getResortsByRegion(regionIds: string[]): Resort[] {
  const allResorts = cachedResorts ?? [];

  if (regionIds.length === 0) return allResorts;

  const regionMap: Record<string, string[]> = {
    "france-alps": ["France"],
    austria: ["Austria"],
    switzerland: ["Switzerland"],
    italy: ["Italy"],
    "andorra-spain": ["Andorra", "Spain"],
  };

  const allowedCountries = regionIds.flatMap((id) => regionMap[id] || []);

  return allResorts.filter((resort) =>
    allowedCountries.includes(resort.country),
  );
}

/**
 * Get resorts filtered by country (async, fetches from cloud).
 * Accepts either region IDs (e.g. "france-alps") or country names (e.g. "France").
 * @param regionOrCountries - Array of region IDs or country names
 */
export async function getResortsByRegionAsync(
  regionOrCountries: string[],
): Promise<Resort[]> {
  const allResorts = await getAllResortsAsync();

  // If no regions selected, return all
  if (regionOrCountries.length === 0) return allResorts;

  const regionMap: Record<string, string[]> = {
    "france-alps": ["France"],
    austria: ["Austria"],
    switzerland: ["Switzerland"],
    italy: ["Italy"],
    "andorra-spain": ["Andorra", "Spain"],
  };

  // Support region IDs (e.g. "france-alps") or bare country names (e.g. "France")
  const allowedCountries = regionOrCountries.flatMap(
    (id) => regionMap[id] ?? [id],
  );

  return allResorts.filter((resort) =>
    allowedCountries.includes(resort.country),
  );
}

/**
 * Get multiple resorts by IDs in a single query.
 * More efficient than calling getResortByIdAsync multiple times.
 */
export async function getResortsByIds(ids: string[]): Promise<Resort[]> {
  if (ids.length === 0) return [];

  // Check cache first
  if (cachedResorts) {
    const cached = cachedResorts.filter((r) => ids.includes(r.id));
    if (cached.length === ids.length) return cached;
  }

  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("resort")
      .select("*")
      .in("id", ids);

    if (error || !data) {
      return [];
    }

    const supplementary = cachedSupplementary ?? await fetchSupplementaryData();
    return (data as SupabaseResortRow[]).map((row) =>
      supabaseRowToResort(row, supplementary),
    );
  } catch (_e: unknown) {
    return [];
  }
}

/**
 * Get resort counts grouped by country from Supabase.
 * Returns a map of country name to resort count.
 */
export async function getResortCountsByCountry(): Promise<
  Record<string, number>
> {
  if (!supabase || !isSupabaseConfigured) {
    return {};
  }
  const client = supabase;

  // Wrap builder in a native Promise first — Hermes does not reliably adopt
  // custom thenables in Promise.race.
  type CountryResult = {
    data: { country: string }[] | null;
    error: { message: string } | null;
  };
  const fetchPromise = new Promise<CountryResult>((resolve, reject) => {
    (
      client
        .from("resort")
        .select("country") as unknown as PromiseLike<CountryResult>
    ).then(resolve, reject);
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Resort counts fetch timed out")), 8000),
  );

  try {
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn("Failed to fetch resort counts:", error?.message);
      return {};
    }

    // Count resorts per country
    const counts: Record<string, number> = {};
    data.forEach((row: { country: string }) => {
      counts[row.country] = (counts[row.country] || 0) + 1;
    });

    return counts;
  } catch (e: unknown) {
    // eslint-disable-next-line no-console
    console.warn(
      "Error fetching resort counts:",
      e instanceof Error ? e.message : e,
    );
    return {};
  }
}

/**
 * Preload resorts from cloud into cache.
 * Call this on app init for faster subsequent access.
 */
export async function preloadResorts(): Promise<void> {
  await fetchCloudResorts();
}

// ─────────────────────────────────────────────────────────────────────────────
// Similar resorts logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute similarity score between two resorts.
 * Higher score = more similar.
 */
function computeSimilarity(target: Resort, candidate: Resort): number {
  let score = 0;

  // Geographic proximity
  if (target.country === candidate.country) score += 30;
  if (target.region === candidate.region) score += 20;

  // Price band similarity (within €50 daily cost)
  const priceDiff = Math.abs(
    target.attributes.averageDailyCost - candidate.attributes.averageDailyCost,
  );
  if (priceDiff < 30) score += 25;
  else if (priceDiff < 50) score += 15;
  else if (priceDiff < 80) score += 5;

  // Size similarity (within 50km of pistes)
  const sizeDiff = Math.abs(target.stats.totalKm - candidate.stats.totalKm);
  if (sizeDiff < 30) score += 15;
  else if (sizeDiff < 60) score += 10;
  else if (sizeDiff < 100) score += 5;

  // Terrain profile similarity (advanced % within 15 points)
  const terrainDiff = Math.abs(
    target.terrain.advanced - candidate.terrain.advanced,
  );
  if (terrainDiff < 10) score += 15;
  else if (terrainDiff < 20) score += 10;
  else if (terrainDiff < 30) score += 5;

  // Snow reliability similarity
  const snowDiff = Math.abs(
    target.attributes.snowReliability - candidate.attributes.snowReliability,
  );
  if (snowDiff <= 1) score += 10;
  else if (snowDiff <= 2) score += 5;

  return score;
}

/**
 * Get resorts similar to a given resort.
 * Uses geographic, price, size, terrain, and snow reliability factors.
 */
export async function getSimilarResorts(
  resortId: string,
  limit = 5,
): Promise<Resort[]> {
  const target = await getResortByIdAsync(resortId);
  if (!target) return [];

  const allResorts = await getAllResortsAsync();

  return allResorts
    .filter((r) => r.id !== resortId)
    .map((r) => ({
      resort: r,
      score: computeSimilarity(target, r),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.resort);
}

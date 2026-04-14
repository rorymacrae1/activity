import { supabase, isSupabaseConfigured } from "@lib/supabase";
import type { Resort, TerrainDistribution } from "@/types/resort";
import { getResortHeroImage } from "@/data/resortImages";
import { getResortNearestAirport } from "@/data/resortNearestAirports";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase related table schemas (embedded via PostgREST joins)
// ─────────────────────────────────────────────────────────────────────────────

interface CostDataRow {
  lift_pass_daily_gbp: number | null;
  lift_pass_weekly_gbp: number | null;
  mountain_lunch_gbp: number | null;
  beer_on_mountain_gbp: number | null;
  ski_rental_daily_gbp: number | null;
  ski_school_half_day_gbp: number | null;
  overall_cost_index: number | null;
  year: number;
}

interface SlopeDataRow {
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
}

interface SeasonTimingRow {
  season_open: string | null;
  season_close: string | null;
  best_weeks: string | null;
  avoid_weeks: string | null;
  good_christmas: boolean | null;
  good_late_season: boolean | null;
  good_long_weekend: boolean | null;
  school_hols_busy: string | null;
}

interface AirportLinkRow {
  iata_code: string;
  airport_name: string | null;
  transfer_mins: number | null;
  direct_flights_available: boolean | null;
  shuttle_available: boolean | null;
  uk_departure_airports: string | null;
  flight_time_mins: number | null;
  seasonal_only: boolean | null;
}

interface FacilityRow {
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
}

interface AccommodationRow {
  type: string | null;
  name: string | null;
  stars: number | null;
  ski_in_out: boolean | null;
  kids_club: boolean | null;
  price_per_night_gbp: number | null;
  min_nights: number | null;
  catered: boolean | null;
  booking_url: string | null;
}

interface WeatherMonthRow {
  month: number;
  avg_temp_c: number | null;
  avg_wind_kph: number | null;
  wind_chill_c: number | null;
  avg_bluebird_days: number | null;
  avg_snowfall_cm: number | null;
  snow_depth_cm: number | null;
  visibility_score: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PostGIS EWKB decoder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decode a PostGIS EWKB hex string (geography Point, SRID 4326) into
 * { lat, lng }. Returns null if the string is missing or unparseable.
 *
 * EWKB layout (little-endian Point with SRID):
 *   byte 0    : byte-order flag (01 = LE)
 *   bytes 1-4 : geometry type  (0x20000001 = Point + SRID flag)
 *   bytes 5-8 : SRID           (0x10E6 = 4326)
 *   bytes 9-16: X coordinate   (longitude, IEEE-754 double)
 *   bytes 17-24: Y coordinate  (latitude,  IEEE-754 double)
 */
function parseWKBPoint(
  hex: string | null,
): { lat: number; lng: number } | null {
  if (!hex || hex.length < 42) return null;
  try {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    const view = new DataView(bytes.buffer);
    const isLE = bytes[0] === 1;
    const geomType = isLE ? view.getUint32(1, true) : view.getUint32(1, false);
    const hasEWKB = (geomType & 0x20000000) !== 0;
    const offset = hasEWKB ? 9 : 5;
    const lng = view.getFloat64(offset, isLE);
    const lat = view.getFloat64(offset + 8, isLE);
    return { lat, lng };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase resort table schema (from existing database)
// ─────────────────────────────────────────────────────────────────────────────

interface SupabaseResortRow {
  id: string;
  name: string;
  country: string;
  region: string | null;
  location: string | null; // PostGIS EWKB hex — decoded via parseWKBPoint()
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
  // Embedded related tables (PostgREST join)
  cost_data: CostDataRow[] | null;
  slope_data: SlopeDataRow[] | null;
  season_timing: SeasonTimingRow[] | null;
  airport_link: AirportLinkRow[] | null;
  facility: FacilityRow[] | null;
  accommodation: AccommodationRow[] | null;
  weather_month: WeatherMonthRow[] | null;
}

/**
 * Convert Supabase resort row to app Resort type.
 * Maps between database schema and app's expected format.
 */
function supabaseRowToResort(row: SupabaseResortRow): Resort {
  // Calculate terrain percentages from run counts.
  // Assign beginner and advanced first; intermediate absorbs rounding remainder.
  const blueRuns = row.blue_runs ?? 0;
  const redRuns = row.red_runs ?? 0;
  const blackRuns = row.black_runs ?? 0;
  const totalRuns = blueRuns + redRuns + blackRuns;
  const terrainDistribution: TerrainDistribution =
    totalRuns > 0
      ? (() => {
          const beginner = Math.round((blueRuns / totalRuns) * 100);
          const advanced = Math.round((blackRuns / totalRuns) * 100);
          return {
            beginner,
            intermediate: 100 - beginner - advanced,
            advanced,
          };
        })()
      : { beginner: 33, intermediate: 34, advanced: 33 };

  // ── Related table data (may be null if not yet populated) ─────────────────

  // cost_data: multiple rows per resort (one per year) — take the most recent
  const cost =
    [...(row.cost_data ?? [])].sort((a, b) => b.year - a.year)[0] ?? null;

  // slope_data: unique per resort
  const slopes = row.slope_data?.[0] ?? null;

  // season_timing: unique per resort
  const timing = row.season_timing?.[0] ?? null;

  // airport_link: multiple rows — pick closest transfer time as primary airport
  const primaryAirport =
    [...(row.airport_link ?? [])].sort(
      (a, b) => (a.transfer_mins ?? 999) - (b.transfer_mins ?? 999),
    )[0] ?? null;

  // Fall back to local lookup if DB has no airport data
  const localAirport = getResortNearestAirport(row.name);
  const airportIata = primaryAirport?.iata_code ?? localAirport.iata;
  const airportTransferMins =
    primaryAirport?.transfer_mins ?? localAirport.transferTimeMinutes;

  // ── Season dates ────────────────────────────────────────────────────────────
  // Prefer per-resort season_timing; fall back to dynamic current-season estimate.
  const now = new Date();
  const seasonYear =
    now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
  const seasonStart = timing?.season_open ?? `${seasonYear - 1}-12-01`;
  const seasonEnd = timing?.season_close ?? `${seasonYear}-06-30`;

  // ── Costs (stored in GBP) ───────────────────────────────────────────────────
  const liftPassDayCost = cost?.lift_pass_daily_gbp ?? 60;
  const liftPassSixDayCost = cost?.lift_pass_weekly_gbp ?? 300;
  // Average daily: lift pass + lunch + half-day rental (own skis half the time)
  const avgDailyCost = cost
    ? Math.round(
        (cost.lift_pass_daily_gbp ?? 60) +
          (cost.mountain_lunch_gbp ?? 25) +
          (cost.ski_rental_daily_gbp ?? 40) / 2,
      )
    : 150;

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalKm = slopes?.total_km ?? row.total_km_piste ?? 0;
  const liftsTotal = slopes?.lifts_total ?? 0;
  const snowParkCount =
    ((slopes?.snow_park ?? row.snow_park) ? 1 : 0) +
    (slopes?.half_pipe ? 1 : 0);

  // ── Weather data ────────────────────────────────────────────────────────────
  // Peak season = December (12) through March (3)
  const PEAK_MONTHS = new Set([12, 1, 2, 3]);
  const peakWeather = (row.weather_month ?? []).filter((w) =>
    PEAK_MONTHS.has(w.month),
  );
  const avgPeakSnowfall = peakWeather.length
    ? peakWeather.reduce((s, w) => s + (w.avg_snowfall_cm ?? 0), 0) /
      peakWeather.length
    : null;
  const avgBluebirdDays = peakWeather.length
    ? Math.round(
        peakWeather.reduce((s, w) => s + (w.avg_bluebird_days ?? 0), 0) /
          peakWeather.length,
      )
    : null;

  // ── Snow reliability ────────────────────────────────────────────────────────
  // Boost score by 1 if DB data confirms strong snowfall (>50cm avg peak month)
  const baseSnowScore = row.snow_sure_rating ?? row.snow_sure_score ?? 3;
  const snowfallBoost = avgPeakSnowfall != null && avgPeakSnowfall > 50 ? 1 : 0;
  const snowReliability = Math.min(
    5,
    baseSnowScore + (row.glacier_skiing ? 1 : 0) + snowfallBoost,
  ) as 1 | 2 | 3 | 4 | 5;

  // ── Accommodation data ──────────────────────────────────────────────────────
  const accommodations = row.accommodation ?? [];
  const hasSkiInOut = accommodations.some((a) => a.ski_in_out);
  const hasCateredChalet = accommodations.some((a) => a.catered);
  const hasKidsClub = accommodations.some((a) => a.kids_club);

  // ── Facility data ────────────────────────────────────────────────────────────
  const facilities = row.facility ?? [];
  const barCount = facilities.filter((f) => f.apres_ski).length || 5;
  const hasKidsLessons = facilities.some((f) => f.kids_lessons);
  const hasPrivateLessons = facilities.some((f) => f.private_available);
  const facilityNightlifeLevels = facilities
    .filter((f) => f.nightlife_level != null)
    .map((f) => f.nightlife_level as number);
  const avgFacilityNightlife = facilityNightlifeLevels.length
    ? Math.round(
        facilityNightlifeLevels.reduce((s, v) => s + v, 0) /
          facilityNightlifeLevels.length,
      )
    : null;
  const whiteoutActivities = facilities
    .filter((f) => f.whiteout_activity && f.name)
    .map((f) => f.name as string)
    .slice(0, 3);

  // ── Nightlife & family scores ───────────────────────────────────────────────
  const nightlifeScore = (avgFacilityNightlife ?? row.apres_ski_rating ?? 3) as
    | 1
    | 2
    | 3
    | 4
    | 5;
  const familyPoints =
    (row.beginner_area ? 2 : 0) +
    (hasKidsLessons ? 2 : 0) +
    (hasPrivateLessons ? 1 : 0) +
    (hasKidsClub ? 1 : 0) +
    (row.adaptive_ski_school ? 1 : 0) +
    (row.wheelchair_accessible ? 1 : 0) +
    (row.disability_access ? 1 : 0);
  const familyScore = (Math.min(5, Math.max(1, familyPoints)) || 3) as
    | 1
    | 2
    | 3
    | 4
    | 5;

  // Crowd proxy — no direct column yet
  const crowdLevel = 3 as 1 | 2 | 3 | 4 | 5;

  // ── Activities ──────────────────────────────────────────────────────────────
  const otherActivities: string[] = [];
  if (row.off_piste || (row.off_piste_score ?? 0) >= 3)
    otherActivities.push("Off-piste skiing");
  if (row.backcountry_access || slopes?.off_piste_guided)
    otherActivities.push("Backcountry access");
  if (row.heli_skiing_available) otherActivities.push("Heli-skiing");
  if (row.night_skiing_available) otherActivities.push("Night skiing");
  if (row.glacier_skiing) otherActivities.push("Glacier skiing");
  if (row.freeride_world_tour) otherActivities.push("Freeride World Tour stop");
  if (slopes?.half_pipe) otherActivities.push("Half-pipe");
  if (slopes?.mogul_field) otherActivities.push("Mogul field");
  if (whiteoutActivities.length) otherActivities.push(...whiteoutActivities);
  if (hasSkiInOut) otherActivities.push("Ski-in/ski-out accommodation");

  // ── Highlights ──────────────────────────────────────────────────────────────
  const highlights: string[] = [
    totalKm ? `${totalKm}km of pistes` : "",
    row.car_free_town ? "Car-free resort" : "",
    slopes?.snow_park || row.snow_park ? "Snow park" : "",
    row.glacier_skiing ? "Glacier skiing" : "",
    row.night_skiing_available
      ? `Night skiing (${row.night_skiing_km ?? "?"}km)`
      : "",
    row.train_accessible
      ? row.eurostar_direct
        ? "Eurostar direct"
        : `Train accessible (${row.train_journey_hours ?? "?"}h)`
      : "",
    row.olympic_history
      ? `Olympic history: ${row.olympic_detail || "Yes"}`
      : "",
    row.freeride_world_tour ? "Freeride World Tour stop" : "",
    hasCateredChalet ? "Catered chalets available" : "",
    avgBluebirdDays != null && avgBluebirdDays >= 10
      ? `~${avgBluebirdDays} bluebird days/month`
      : "",
  ].filter(Boolean);

  const style = row.style ?? "traditional";
  const region = row.region ?? row.country;

  return {
    id: row.id,
    name: row.name,
    country: row.country,
    region,
    subRegion: undefined,
    location: {
      lat: parseWKBPoint(row.location)?.lat ?? 0,
      lng: parseWKBPoint(row.location)?.lng ?? 0,
      villageAltitude: row.altitude_base_m ?? row.min_altitude_m ?? 0,
      peakAltitude: row.altitude_top_m ?? row.max_altitude_m ?? 0,
    },
    terrain: terrainDistribution,
    stats: {
      totalRuns,
      totalKm,
      lifts: liftsTotal,
      snowParks: snowParkCount,
    },
    attributes: {
      averageDailyCost: avgDailyCost,
      liftPassDayCost,
      liftPassSixDayCost,
      crowdLevel,
      familyScore,
      nightlifeScore,
      snowReliability,
      liftModernity: style === "modern" ? 4 : 3,
      nearestAirport: airportIata,
      transferTimeMinutes: airportTransferMins,
      townStyle: row.car_free_town
        ? "Purpose-built"
        : style === "modern"
          ? "Modern resort"
          : "Traditional village",
      barCount,
      otherActivities,
      hasSkiInOut,
      hasCatered: hasCateredChalet,
      trainAccessible: row.train_accessible ?? false,
      eurostarDirect: row.eurostar_direct ?? false,
      trainJourneyHours: row.train_journey_hours ?? null,
      driveHoursFromLondon: row.drive_hours_from_london ?? null,
    },
    content: {
      description: `${row.name} is a ${style} ski resort in ${region}, ${row.country}.`,
      highlights,
    },
    assets: {
      heroImage: row.hero_image
        ? `${row.hero_image.split("?")[0]}?w=1200&q=80&auto=format&fit=crop`
        : getResortHeroImage(row.name),
      pisteMap: "",
    },
    season: {
      start: seasonStart,
      end: seasonEnd,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache for cloud resorts
// ─────────────────────────────────────────────────────────────────────────────

let cachedResorts: Resort[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the resort cache (useful after uploading new data).
 */
export function clearResortCache(): void {
  cachedResorts = null;
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
        .select(
          "*, cost_data(*), slope_data(*), season_timing(*), airport_link(*), facility(*), accommodation(*), weather_month(*)",
        )
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

    cachedResorts = (data as SupabaseResortRow[]).map(supabaseRowToResort);
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
      .select(
        "*, cost_data(*), slope_data(*), season_timing(*), airport_link(*), facility(*), accommodation(*), weather_month(*)",
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return supabaseRowToResort(data as SupabaseResortRow);
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
      .select(
        "*, cost_data(*), slope_data(*), season_timing(*), airport_link(*), facility(*), accommodation(*), weather_month(*)",
      )
      .in("id", ids);

    if (error || !data) {
      return [];
    }

    return (data as SupabaseResortRow[]).map(supabaseRowToResort);
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

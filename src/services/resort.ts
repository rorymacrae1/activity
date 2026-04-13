import { supabase, isSupabaseConfigured } from "@lib/supabase";
import type { Resort, TerrainDistribution } from "@/types/resort";
import { getResortHeroImage } from "@/data/resortImages";
import { getResortNearestAirport } from "@/data/resortNearestAirports";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase resort table schema (from existing database)
// ─────────────────────────────────────────────────────────────────────────────

interface SupabaseResortRow {
  id: string;
  name: string;
  country: string;
  region: string;
  location: string; // PostGIS geometry
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

/**
 * Convert Supabase resort row to app Resort type.
 * Maps between database schema and app's expected format.
 */
function supabaseRowToResort(row: SupabaseResortRow): Resort {
  // Calculate terrain percentages from run counts
  const totalRuns = row.blue_runs + row.red_runs + row.black_runs;
  const terrainDistribution: TerrainDistribution =
    totalRuns > 0
      ? {
          beginner: Math.round((row.blue_runs / totalRuns) * 100),
          intermediate: Math.round((row.red_runs / totalRuns) * 100),
          advanced: Math.round((row.black_runs / totalRuns) * 100),
        }
      : { beginner: 33, intermediate: 34, advanced: 33 };

  return {
    id: row.id,
    name: row.name,
    country: row.country,
    region: row.region,
    subRegion: undefined,
    location: {
      lat: 0, // PostGIS geometry needs decoding - placeholder
      lng: 0,
      villageAltitude: row.altitude_base_m,
      peakAltitude: row.altitude_top_m,
    },
    terrain: terrainDistribution,
    stats: {
      totalRuns: totalRuns,
      totalKm: row.total_km_piste,
      lifts: 0, // Not in current schema
      snowParks: row.snow_park ? 1 : 0,
    },
    attributes: {
      averageDailyCost: 150, // Default placeholder
      liftPassDayCost: 60,
      liftPassSixDayCost: 300,
      crowdLevel: 3,
      familyScore: row.beginner_area ? 4 : 3,
      nightlifeScore: row.style === "modern" ? 4 : 3,
      snowReliability: row.snow_sure_score,
      liftModernity: row.style === "modern" ? 4 : 3,
      nearestAirport: getResortNearestAirport(row.name).iata,
      transferTimeMinutes: getResortNearestAirport(row.name)
        .transferTimeMinutes,
      townStyle: row.car_free_town
        ? "Purpose-built"
        : row.style === "modern"
          ? "Modern resort"
          : "Traditional village",
      barCount: 5,
      otherActivities: row.off_piste ? ["Off-piste skiing"] : [],
    },
    content: {
      description: `${row.name} is a ${row.style} ski resort in ${row.region}, ${row.country}.`,
      highlights: [
        `${row.total_km_piste}km of pistes`,
        row.car_free_town ? "Car-free resort" : "",
        row.snow_park ? "Snow park" : "",
        row.olympic_history
          ? `Olympic history: ${row.olympic_detail || "Yes"}`
          : "",
      ].filter(Boolean),
    },
    assets: {
      heroImage: row.hero_image
        ? `${row.hero_image.split("?")[0]}?w=1200&q=80&auto=format&fit=crop`
        : getResortHeroImage(row.name),
      pisteMap: "",
    },
    season: {
      start: "2024-12-01",
      end: "2025-04-15",
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
      console.warn("Failed to fetch resorts from Supabase:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    cachedResorts = (data as SupabaseResortRow[]).map(supabaseRowToResort);
    cacheTimestamp = Date.now();
    return cachedResorts;
  } catch (err) {
    console.warn("Error fetching cloud resorts:", err);
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

    return supabaseRowToResort(data as SupabaseResortRow);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API (cloud-only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all resorts from Supabase.
 * Returns empty array if fetch fails.
 */
export async function getAllResortsAsync(): Promise<Resort[]> {
  const cloudResorts = await fetchCloudResorts();
  return cloudResorts ?? [];
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
 * @param countries - Array of country names as stored in Supabase (e.g., ["France", "Austria"])
 */
export async function getResortsByRegionAsync(
  countries: string[],
): Promise<Resort[]> {
  const allResorts = await getAllResortsAsync();

  // If no countries selected, return all
  if (countries.length === 0) return allResorts;

  // Filter by country directly (countries array now contains DB country names)
  return allResorts.filter((resort) => countries.includes(resort.country));
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

    return (data as SupabaseResortRow[]).map(supabaseRowToResort);
  } catch {
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
      console.warn("Failed to fetch resort counts:", error?.message);
      return {};
    }

    // Count resorts per country
    const counts: Record<string, number> = {};
    data.forEach((row: { country: string }) => {
      counts[row.country] = (counts[row.country] || 0) + 1;
    });

    return counts;
  } catch (err) {
    console.warn("Error fetching resort counts:", err);
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

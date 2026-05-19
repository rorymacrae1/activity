import { supabase, isSupabaseConfigured } from "@lib/supabase";
import type { Resort } from "@/types/resort";
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
// Supabase row → Resort mapper (JSONB columns)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shape returned by `select("*")` on the `resorts` table.
 * JSONB columns are typed as `unknown` and validated at runtime.
 */
interface SupabaseResortRow {
  id: string;
  name: string;
  country: string;
  region: string;
  sub_region: string | null;
  location: unknown;
  terrain: unknown;
  stats: unknown;
  attributes: unknown;
  content: unknown;
  assets: unknown;
  season: unknown;
  hero_image: string | null;
  created_at: string;
  updated_at: string;
}

/** Safely read a number from an unknown JSONB field. */
function num(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}

/** Safely read a string from an unknown JSONB field. */
function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/** Safely read a boolean from an unknown JSONB field. */
function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/** Cast an unknown to a Record for property access. Returns {} if not an object. */
function obj(v: unknown): Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

/** Cast unknown to an array of strings. */
function strArr(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : [];
}

/**
 * Convert a Supabase resort row (with JSONB columns) to the app Resort type.
 */
function supabaseRowToResort(row: SupabaseResortRow): Resort {
  const loc = obj(row.location);
  const ter = obj(row.terrain);
  const st = obj(row.stats);
  const attr = obj(row.attributes);
  const cont = obj(row.content);
  const ast = obj(row.assets);
  const seas = obj(row.season);

  const localAirport = getResortNearestAirport(row.name);

  return {
    id: row.id,
    name: row.name,
    country: row.country,
    region: row.region ?? row.country,
    subRegion: row.sub_region ?? undefined,
    continent: getContinent(row.country),
    location: {
      lat: num(loc.lat),
      lng: num(loc.lng),
      villageAltitude: num(loc.villageAltitude),
      peakAltitude: num(loc.peakAltitude),
    },
    terrain: {
      beginner: num(ter.beginner, 33),
      intermediate: num(ter.intermediate, 34),
      advanced: num(ter.advanced, 33),
    },
    stats: {
      totalRuns: num(st.totalRuns),
      totalKm: num(st.totalKm),
      lifts: num(st.lifts),
      snowParks: num(st.snowParks),
    },
    attributes: {
      averageDailyCost: num(attr.averageDailyCost, 150),
      liftPassDayCost: num(attr.liftPassDayCost, 60),
      liftPassSixDayCost: num(attr.liftPassSixDayCost, 300),
      crowdLevel: num(attr.crowdLevel, 3) as 1 | 2 | 3 | 4 | 5,
      familyScore: num(attr.familyScore, 3) as 1 | 2 | 3 | 4 | 5,
      nightlifeScore: num(attr.nightlifeScore, 3) as 1 | 2 | 3 | 4 | 5,
      snowReliability: num(attr.snowReliability, 3) as 1 | 2 | 3 | 4 | 5,
      liftModernity: num(attr.liftModernity, 3) as 1 | 2 | 3 | 4 | 5,
      nearestAirport: str(attr.nearestAirport) || localAirport.iata,
      transferTimeMinutes:
        num(attr.transferTimeMinutes) || localAirport.transferTimeMinutes,
      townStyle: (str(attr.townStyle) ||
        "Traditional village") as Resort["attributes"]["townStyle"],
      barCount: num(attr.barCount, 5),
      otherActivities: strArr(attr.otherActivities),
      hasSkiInOut: bool(attr.hasSkiInOut),
      hasCatered: bool(attr.hasCatered),
      trainAccessible: bool(attr.trainAccessible),
      eurostarDirect: bool(attr.eurostarDirect),
      trainJourneyHours:
        attr.trainJourneyHours != null ? num(attr.trainJourneyHours) : null,
      driveHoursFromLondon:
        attr.driveHoursFromLondon != null
          ? num(attr.driveHoursFromLondon)
          : null,
    },
    content: {
      description: str(
        cont.description,
        `${row.name} is a ski resort in ${row.region ?? row.country}, ${row.country}.`,
      ),
      highlights: strArr(cont.highlights),
    },
    assets: {
      heroImage:
        row.hero_image ?? (str(ast.heroImage) || getResortHeroImage(row.name)),
      pisteMap: str(ast.pisteMap),
    },
    season: {
      start: str(seas.start, "2024-12-01"),
      end: str(seas.end, "2025-04-30"),
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
        .from("resorts")
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
      .from("resorts")
      .select("*")
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
      .from("resorts")
      .select("*")
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
        .from("resorts")
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

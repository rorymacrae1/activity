/**
 * Resort location information.
 */
export interface ResortLocation {
  lat: number;
  lng: number;
  villageAltitude: number; // meters
  peakAltitude: number; // meters
}

/**
 * Terrain distribution by difficulty.
 */
export interface TerrainDistribution {
  beginner: number; // percentage (0-100)
  intermediate: number;
  advanced: number;
}

/**
 * Resort statistics.
 */
export interface ResortStats {
  totalRuns: number;
  totalKm: number;
  lifts: number;
  snowParks: number;
}

/**
 * Resort attributes used for matching.
 */
export interface ResortAttributes {
  averageDailyCost: number; // EUR
  liftPassDayCost: number;
  liftPassSixDayCost: number;
  crowdLevel: number; // 1-5
  familyScore: number; // 1-5
  nightlifeScore: number; // 1-5
  snowReliability: number; // 1-5
  liftModernity: number; // 1-5
  nearestAirport: string;
  transferTimeMinutes: number;
  /** Style of the resort village */
  townStyle: "Traditional village" | "Purpose-built" | "Lively town" | "Small hamlet" | "Modern resort";
  /** Approximate number of après-ski bars/clubs */
  barCount: number;
  /** Non-ski activities available at the resort */
  otherActivities: string[];
}

/**
 * Resort content (descriptions, highlights).
 */
export interface ResortContent {
  description: string;
  highlights: string[];
}

/**
 * Resort image assets.
 */
export interface ResortAssets {
  heroImage: string;
  pisteMap: string;
}

/**
 * Resort season dates.
 */
export interface ResortSeason {
  start: string; // ISO date string
  end: string; // ISO date string
}

/**
 * Complete resort data.
 */
export interface Resort {
  id: string;
  name: string;
  country: string;
  region: string;
  subRegion?: string;
  location: ResortLocation;
  terrain: TerrainDistribution;
  stats: ResortStats;
  attributes: ResortAttributes;
  content: ResortContent;
  assets: ResortAssets;
  season: ResortSeason;
}

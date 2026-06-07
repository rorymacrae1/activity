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
  townStyle:
    | "Traditional village"
    | "Purpose-built"
    | "Lively town"
    | "Small hamlet"
    | "Modern resort";
  /** Approximate number of après-ski bars/clubs */
  barCount: number;
  /** Non-ski activities available at the resort */
  otherActivities: string[];
  /** Whether ski-in/ski-out accommodation exists */
  hasSkiInOut?: boolean;
  /** Whether catered chalet accommodation exists */
  hasCatered?: boolean;
  /** Whether the resort has a kids club */
  hasKidsClub?: boolean;
  /** Whether the resort is accessible by train */
  trainAccessible?: boolean;
  /** Whether the resort has a direct Eurostar connection */
  eurostarDirect?: boolean;
  /** Train journey time from London in hours */
  trainJourneyHours?: number | null;
  /** Driving time from London in hours */
  driveHoursFromLondon?: number | null;
}

/**
 * Resort content (descriptions, highlights).
 */
export interface ResortContent {
  description: string;
  highlights: string[];
  /** AI-generated après-ski summary */
  apresSummary?: string;
  /** What to do on bad weather days */
  whiteoutSummary?: string;
  /** Train/drive route from UK without flying */
  noFlySummary?: string;
  /** Snow reliability narrative */
  snowmakingSummary?: string;
  /** Off-piste skiing summary */
  offPisteSummary?: string;
  /** Live webcam URL */
  webcamUrl?: string;
  /** Snow report URL */
  snowReportUrl?: string;
}

/**
 * Monthly weather data for a resort.
 */
export interface ResortMonthWeather {
  month: number; // 1-12
  avgTempC: number;
  avgSnowfallCm: number;
  avgBluebirdDays: number;
  avgWindKph: number;
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
 * Individual accommodation option at a resort.
 */
export interface AccommodationOption {
  type: "hotel" | "chalet" | "apartment" | "hostel";
  name: string;
  stars: number | null;
  skiInOut: boolean;
  kidsClub: boolean;
  pricePerNightGbp: number | null;
  catered: boolean;
}

/**
 * Individual facility at a resort.
 */
export interface FacilityOption {
  type: "bar" | "restaurant" | "ski_school" | "ski_rental" | "spa" | "pool" | "supermarket" | "hotel";
  name: string;
  rating: number | null;
  avgPriceGbp: number | null;
  whiteoutActivity: boolean;
  apresSki: boolean;
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
  continent: "Europe" | "North America" | "South America" | "Asia" | "Oceania";
  location: ResortLocation;
  terrain: TerrainDistribution;
  stats: ResortStats;
  attributes: ResortAttributes;
  content: ResortContent;
  assets: ResortAssets;
  season: ResortSeason;
  /** Monthly weather data when available */
  weather?: ResortMonthWeather[];
  /** Detailed accommodation options from Supabase */
  accommodationOptions?: AccommodationOption[];
  /** Detailed facility listings from Supabase */
  facilityOptions?: FacilityOption[];
}

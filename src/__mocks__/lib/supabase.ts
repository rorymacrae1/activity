/**
 * Mock for src/lib/supabase.
 * Returns a fake Supabase client backed by a small in-memory resort dataset
 * shaped as JSONB columns to match the actual Supabase `resorts` table.
 */

interface MockResortRow {
  id: string;
  name: string;
  country: string;
  region: string;
  sub_region: string | null;
  location: { lat: number; lng: number; villageAltitude: number; peakAltitude: number };
  terrain: { beginner: number; intermediate: number; advanced: number };
  stats: { totalRuns: number; totalKm: number; lifts: number; snowParks: number };
  attributes: Record<string, unknown>;
  content: { description: string; highlights: string[] };
  assets: { heroImage: string; pisteMap: string };
  season: { start: string; end: string };
  hero_image: string | null;
  created_at: string;
  updated_at: string;
}

const MOCK_RESORTS: MockResortRow[] = [
  {
    id: "val-thorens",
    name: "Val Thorens",
    country: "France",
    region: "Savoie",
    sub_region: null,
    location: { lat: 45.298, lng: 6.58, villageAltitude: 2300, peakAltitude: 3230 },
    terrain: { beginner: 25, intermediate: 50, advanced: 25 },
    stats: { totalRuns: 120, totalKm: 600, lifts: 156, snowParks: 2 },
    attributes: {
      averageDailyCost: 230,
      liftPassDayCost: 58,
      liftPassSixDayCost: 290,
      crowdLevel: 4,
      familyScore: 4,
      nightlifeScore: 5,
      snowReliability: 5,
      liftModernity: 4,
      nearestAirport: "GVA",
      transferTimeMinutes: 150,
      townStyle: "Purpose-built",
      barCount: 8,
      otherActivities: ["Glacier skiing", "Half-pipe"],
      hasSkiInOut: true,
      hasCatered: true,
      trainAccessible: false,
      eurostarDirect: false,
      trainJourneyHours: null,
      driveHoursFromLondon: null,
    },
    content: {
      description: "Val Thorens is the highest ski resort in Europe.",
      highlights: ["600km of pistes", "Car-free resort", "Snow park", "Glacier skiing"],
    },
    assets: { heroImage: "https://example.com/val-thorens.jpg", pisteMap: "" },
    season: { start: "2025-11-22", end: "2027-05-03" },
    hero_image: "https://example.com/val-thorens.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "chamonix",
    name: "Chamonix",
    country: "France",
    region: "Haute-Savoie",
    sub_region: null,
    location: { lat: 45.924, lng: 6.869, villageAltitude: 1035, peakAltitude: 3842 },
    terrain: { beginner: 14, intermediate: 36, advanced: 50 },
    stats: { totalRuns: 70, totalKm: 152, lifts: 47, snowParks: 0 },
    attributes: {
      averageDailyCost: 170,
      liftPassDayCost: 65,
      liftPassSixDayCost: 310,
      crowdLevel: 4,
      familyScore: 2,
      nightlifeScore: 4,
      snowReliability: 4,
      liftModernity: 3,
      nearestAirport: "GVA",
      transferTimeMinutes: 80,
      townStyle: "Lively town",
      barCount: 10,
      otherActivities: ["Off-piste skiing", "Backcountry access"],
      hasSkiInOut: false,
      hasCatered: false,
      trainAccessible: false,
      eurostarDirect: false,
      trainJourneyHours: null,
      driveHoursFromLondon: null,
    },
    content: {
      description: "Chamonix is a legendary mountain town at the foot of Mont Blanc.",
      highlights: ["152km of pistes", "Off-piste paradise"],
    },
    assets: { heroImage: "https://example.com/chamonix.jpg", pisteMap: "" },
    season: { start: "2025-12-01", end: "2027-04-30" },
    hero_image: "https://example.com/chamonix.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "st-anton",
    name: "St Anton",
    country: "Austria",
    region: "Tyrol",
    sub_region: null,
    location: { lat: 47.129, lng: 10.268, villageAltitude: 1304, peakAltitude: 2811 },
    terrain: { beginner: 17, intermediate: 48, advanced: 35 },
    stats: { totalRuns: 85, totalKm: 301, lifts: 88, snowParks: 1 },
    attributes: {
      averageDailyCost: 190,
      liftPassDayCost: 62,
      liftPassSixDayCost: 310,
      crowdLevel: 4,
      familyScore: 3,
      nightlifeScore: 5,
      snowReliability: 4,
      liftModernity: 4,
      nearestAirport: "INN",
      transferTimeMinutes: 90,
      townStyle: "Lively town",
      barCount: 12,
      otherActivities: ["Off-piste skiing", "Night skiing"],
      hasSkiInOut: false,
      hasCatered: false,
      trainAccessible: false,
      eurostarDirect: false,
      trainJourneyHours: null,
      driveHoursFromLondon: null,
    },
    content: {
      description: "St Anton am Arlberg is the birthplace of alpine skiing.",
      highlights: ["301km of pistes", "Night skiing (4km)"],
    },
    assets: { heroImage: "https://example.com/st-anton.jpg", pisteMap: "" },
    season: { start: "2025-12-01", end: "2027-04-20" },
    hero_image: "https://example.com/st-anton.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "verbier",
    name: "Verbier",
    country: "Switzerland",
    region: "Valais",
    sub_region: null,
    location: { lat: 46.096, lng: 7.228, villageAltitude: 1500, peakAltitude: 3330 },
    terrain: { beginner: 36, intermediate: 43, advanced: 21 },
    stats: { totalRuns: 280, totalKm: 412, lifts: 92, snowParks: 1 },
    attributes: {
      averageDailyCost: 280,
      liftPassDayCost: 75,
      liftPassSixDayCost: 380,
      crowdLevel: 3,
      familyScore: 3,
      nightlifeScore: 5,
      snowReliability: 4,
      liftModernity: 4,
      nearestAirport: "GVA",
      transferTimeMinutes: 150,
      townStyle: "Modern resort",
      barCount: 8,
      otherActivities: ["Off-piste skiing", "Heli-skiing", "Freeride World Tour stop"],
      hasSkiInOut: false,
      hasCatered: false,
      trainAccessible: false,
      eurostarDirect: false,
      trainJourneyHours: null,
      driveHoursFromLondon: null,
    },
    content: {
      description: "Verbier is a world-class freeride destination in the Swiss Alps.",
      highlights: ["412km of pistes", "Snow park", "Heli-skiing"],
    },
    assets: { heroImage: "https://example.com/verbier.jpg", pisteMap: "" },
    season: { start: "2025-11-30", end: "2027-04-20" },
    hero_image: "https://example.com/verbier.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "grandvalira",
    name: "Grandvalira",
    country: "Andorra",
    region: "Encamp",
    sub_region: null,
    location: { lat: 42.551, lng: 1.736, villageAltitude: 1710, peakAltitude: 2640 },
    terrain: { beginner: 30, intermediate: 50, advanced: 20 },
    stats: { totalRuns: 110, totalKm: 215, lifts: 67, snowParks: 1 },
    attributes: {
      averageDailyCost: 120,
      liftPassDayCost: 45,
      liftPassSixDayCost: 230,
      crowdLevel: 3,
      familyScore: 5,
      nightlifeScore: 3,
      snowReliability: 3,
      liftModernity: 4,
      nearestAirport: "TLS",
      transferTimeMinutes: 180,
      townStyle: "Modern resort",
      barCount: 5,
      otherActivities: ["Snow park"],
      hasSkiInOut: false,
      hasCatered: false,
      trainAccessible: false,
      eurostarDirect: false,
      trainJourneyHours: null,
      driveHoursFromLondon: null,
    },
    content: {
      description: "Grandvalira is Andorra's largest ski area.",
      highlights: ["215km of pistes", "Great value", "Family-friendly"],
    },
    assets: { heroImage: "", pisteMap: "" },
    season: { start: "2025-12-01", end: "2027-04-15" },
    hero_image: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "cortina",
    name: "Cortina d'Ampezzo",
    country: "Italy",
    region: "Veneto",
    sub_region: null,
    location: { lat: 46.537, lng: 12.139, villageAltitude: 1224, peakAltitude: 2828 },
    terrain: { beginner: 25, intermediate: 48, advanced: 27 },
    stats: { totalRuns: 52, totalKm: 120, lifts: 36, snowParks: 0 },
    attributes: {
      averageDailyCost: 200,
      liftPassDayCost: 60,
      liftPassSixDayCost: 300,
      crowdLevel: 3,
      familyScore: 4,
      nightlifeScore: 3,
      snowReliability: 3,
      liftModernity: 3,
      nearestAirport: "VCE",
      transferTimeMinutes: 150,
      townStyle: "Traditional village",
      barCount: 5,
      otherActivities: [],
      hasSkiInOut: false,
      hasCatered: false,
      trainAccessible: true,
      eurostarDirect: false,
      trainJourneyHours: 5,
      driveHoursFromLondon: null,
    },
    content: {
      description: "Cortina d'Ampezzo is an elegant resort in the Italian Dolomites.",
      highlights: ["120km of pistes", "Train accessible (5h)"],
    },
    assets: { heroImage: "", pisteMap: "" },
    season: { start: "2025-12-01", end: "2027-04-15" },
    hero_image: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
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
    if (table === "resorts") return makeBuilder([...MOCK_RESORTS]);
    return makeBuilder([]);
  },
};

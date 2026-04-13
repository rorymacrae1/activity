/**
 * Static lookup of nearest ski-accessible airport for each European resort.
 * IATA codes are used to cross-reference the user's home airport.
 * Transfer times are conservative road-transfer estimates in minutes.
 */

interface NearestAirportInfo {
  /** IATA code of the closest practical airport. */
  iata: string;
  /** Approximate road-transfer time from airport to resort (minutes). */
  transferTimeMinutes: number;
}

const DEFAULT: NearestAirportInfo = { iata: "GVA", transferTimeMinutes: 120 };

/** Resort name → nearest airport lookup. Keys match Supabase resort names exactly. */
const RESORT_AIRPORTS: Record<string, NearestAirportInfo> = {
  // Switzerland
  "4 Vallées (Verbier)":                     { iata: "GVA", transferTimeMinutes: 120 },
  "Matterhorn (Zermatt/Cervinia)":            { iata: "GVA", transferTimeMinutes: 225 },
  "Arosa Lenzerheide":                        { iata: "ZRH", transferTimeMinutes: 90 },
  "Engelberg - Titlis":                       { iata: "ZRH", transferTimeMinutes: 90 },
  "Laax":                                     { iata: "ZRH", transferTimeMinutes: 120 },
  "Parsenn":                                  { iata: "ZRH", transferTimeMinutes: 150 },
  "Zell am See-Kaprun":                       { iata: "SZG", transferTimeMinutes: 60 },

  // France
  "Les 3 Vallées (Val Thorens/Méribel/Courchevel)": { iata: "GVA", transferTimeMinutes: 150 },
  "Chamonix Mont-Blanc":                      { iata: "GVA", transferTimeMinutes: 75 },
  "La Plagne":                                { iata: "GVA", transferTimeMinutes: 135 },
  "Tignes – Val d'Isère":                     { iata: "GVA", transferTimeMinutes: 165 },
  "Alpe d'Huez":                              { iata: "GVA", transferTimeMinutes: 180 },
  "Les Portes du Soleil":                     { iata: "GVA", transferTimeMinutes: 75 },
  "Les Arcs":                                 { iata: "GVA", transferTimeMinutes: 150 },
  "Le Grand Massif":                          { iata: "GVA", transferTimeMinutes: 90 },
  "Les 2 Alpes":                              { iata: "GVA", transferTimeMinutes: 195 },
  "Serre Chevalier":                          { iata: "NCE", transferTimeMinutes: 150 },
  "Megève/Saint-Gervais":                     { iata: "GVA", transferTimeMinutes: 75 },
  "Les Sybelles":                             { iata: "GVA", transferTimeMinutes: 165 },

  // Austria
  "Ski Arlberg (St.Anton)":                   { iata: "INN", transferTimeMinutes: 100 },
  "Saalbach Hinterglemm":                     { iata: "SZG", transferTimeMinutes: 75 },
  "Mayrhofen":                                { iata: "INN", transferTimeMinutes: 75 },
  "Silvretta Arena (Ischgl)":                 { iata: "INN", transferTimeMinutes: 90 },
  "SkiWelt":                                  { iata: "MUC", transferTimeMinutes: 120 },
  "Serfaus-Fiss-Ladis":                       { iata: "INN", transferTimeMinutes: 75 },
  "Sölden":                                   { iata: "INN", transferTimeMinutes: 80 },
  "Hintertux Glacier":                        { iata: "INN", transferTimeMinutes: 90 },

  // Italy
  "Monterosa Ski":                            { iata: "TRN", transferTimeMinutes: 120 },
  "Val Gardena":                              { iata: "VRN", transferTimeMinutes: 120 },
  "Via Lattea":                               { iata: "TRN", transferTimeMinutes: 90 },
  "Madonna di Campiglio/Pinzolo/Folgàrida/Marilleva": { iata: "VRN", transferTimeMinutes: 150 },

  // Andorra / Pyrenees
  "Grandvalira":                              { iata: "BCN", transferTimeMinutes: 195 },

  // North America
  "Palisades Tahoe":                          { iata: "RNO", transferTimeMinutes: 90 },
  "Whistler Blackcomb":                       { iata: "YVR", transferTimeMinutes: 135 },
  "Park City":                                { iata: "SLC", transferTimeMinutes: 45 },
  "Niseko United":                            { iata: "CTS", transferTimeMinutes: 180 },
  "Jackson Hole":                             { iata: "JAC", transferTimeMinutes: 30 },
  "Snowmass":                                 { iata: "ASE", transferTimeMinutes: 15 },
  "Big Sky Resort":                           { iata: "BZN", transferTimeMinutes: 60 },
  "White Grizzly":                            { iata: "YCG", transferTimeMinutes: 60 },
};

/**
 * Returns the nearest airport info for the given resort name.
 * Falls back to Geneva (GVA, 120 min) if no match found.
 */
export function getResortNearestAirport(resortName: string): NearestAirportInfo {
  return RESORT_AIRPORTS[resortName] ?? DEFAULT;
}

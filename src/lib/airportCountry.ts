/**
 * Lightweight IATA → country lookup.
 *
 * Uses a small embedded map of UK/Ireland airports so the 540 KB AIRPORTS
 * bundle is never imported just to determine origin country. For all other
 * IATA codes the async fallback queries the lazy-loaded bundle.
 */

/** IATA codes for all UK and Ireland commercial airports. */
const UK_IRELAND_IATA = new Set([
  // England
  "LHR",
  "LGW",
  "STN",
  "LTN",
  "LCY",
  "SEN",
  "LPL",
  "MAN",
  "BHX",
  "BRS",
  "NCL",
  "LBA",
  "EMA",
  "HUY",
  "NQY",
  "EXT",
  "BOH",
  "SOU",
  "CWL",
  "BHD",
  "BFS",
  "PIK",
  "GLA",
  "EDI",
  "ABZ",
  "INV",
  "PSL",
  "KOI",
  "LSI",
  "BEB",
  "SYY",
  "ILY",
  "TRE",
  // Ireland
  "DUB",
  "ORK",
  "SNN",
  "NOC",
  "CFN",
  "GWY",
  "KIR",
  "WAT",
]);

/** Returns true when the IATA code belongs to a UK or Ireland airport. */
export function isUKIrelandAirport(iata: string | null | undefined): boolean {
  if (!iata) return false;
  return UK_IRELAND_IATA.has(iata.toUpperCase());
}

/**
 * Resolve the country name for an IATA code.
 * Returns null if the code is not found in the dataset.
 */
export async function getAirportCountry(
  iata: string | null | undefined,
): Promise<string | null> {
  if (!iata) return null;
  const upper = iata.toUpperCase();
  if (UK_IRELAND_IATA.has(upper)) return "United Kingdom";
  const { AIRPORTS } = await import("@/data/airports");
  return AIRPORTS.find((a) => a.iata === upper)?.country ?? null;
}

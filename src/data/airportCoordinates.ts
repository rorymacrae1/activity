/**
 * Coordinates for airports used in flight-time estimation.
 * Covers all resort destination airports + major European/global departure hubs.
 * Source: OurAirports (public domain).
 */

interface Coordinates {
  lat: number;
  lng: number;
}

/** IATA → { lat, lng } for flight-time calculation. */
export const AIRPORT_COORDS: Record<string, Coordinates> = {
  // ── Resort destination airports ──────────────────────────────────────────
  GVA: { lat: 46.238, lng: 6.109 }, // Geneva
  ZRH: { lat: 47.458, lng: 8.548 }, // Zürich
  INN: { lat: 47.26, lng: 11.344 }, // Innsbruck
  SZG: { lat: 47.793, lng: 13.004 }, // Salzburg
  MUC: { lat: 48.354, lng: 11.786 }, // Munich
  TRN: { lat: 45.201, lng: 7.649 }, // Turin
  VRN: { lat: 45.396, lng: 10.889 }, // Verona
  NCE: { lat: 43.658, lng: 7.216 }, // Nice
  BCN: { lat: 41.297, lng: 2.078 }, // Barcelona
  RNO: { lat: 39.499, lng: -119.768 }, // Reno
  SLC: { lat: 40.788, lng: -111.977 }, // Salt Lake City
  ASE: { lat: 39.223, lng: -106.869 }, // Aspen
  BZN: { lat: 45.778, lng: -111.153 }, // Bozeman
  JAC: { lat: 43.607, lng: -110.738 }, // Jackson Hole
  YVR: { lat: 49.194, lng: -123.184 }, // Vancouver
  YCG: { lat: 49.296, lng: -117.632 }, // Castlegar
  CTS: { lat: 42.775, lng: 141.692 }, // Sapporo (Chitose)

  // ── UK & Ireland ─────────────────────────────────────────────────────────
  LHR: { lat: 51.47, lng: -0.461 }, // London Heathrow
  LGW: { lat: 51.148, lng: -0.19 }, // London Gatwick
  STN: { lat: 51.885, lng: 0.235 }, // London Stansted
  LTN: { lat: 51.875, lng: -0.368 }, // London Luton
  MAN: { lat: 53.354, lng: -2.275 }, // Manchester
  BHX: { lat: 52.454, lng: -1.748 }, // Birmingham
  EDI: { lat: 55.95, lng: -3.373 }, // Edinburgh
  GLA: { lat: 55.872, lng: -4.431 }, // Glasgow
  BRS: { lat: 51.383, lng: -2.719 }, // Bristol
  BFS: { lat: 54.658, lng: -6.216 }, // Belfast
  DUB: { lat: 53.421, lng: -6.27 }, // Dublin

  // ── France ───────────────────────────────────────────────────────────────
  CDG: { lat: 49.013, lng: 2.55 }, // Paris CDG
  ORY: { lat: 48.723, lng: 2.359 }, // Paris Orly
  LYS: { lat: 45.726, lng: 5.091 }, // Lyon
  MRS: { lat: 43.436, lng: 5.215 }, // Marseille
  TLS: { lat: 43.629, lng: 1.364 }, // Toulouse
  BOD: { lat: 44.828, lng: -0.715 }, // Bordeaux
  NTE: { lat: 47.153, lng: -1.611 }, // Nantes

  // ── Germany ──────────────────────────────────────────────────────────────
  FRA: { lat: 50.033, lng: 8.571 }, // Frankfurt
  BER: { lat: 52.362, lng: 13.509 }, // Berlin
  HAM: { lat: 53.63, lng: 9.988 }, // Hamburg
  DUS: { lat: 51.289, lng: 6.767 }, // Düsseldorf
  CGN: { lat: 50.866, lng: 7.143 }, // Cologne
  STR: { lat: 48.69, lng: 9.222 }, // Stuttgart

  // ── Benelux ──────────────────────────────────────────────────────────────
  AMS: { lat: 52.309, lng: 4.764 }, // Amsterdam
  BRU: { lat: 50.902, lng: 4.485 }, // Brussels
  LUX: { lat: 49.627, lng: 6.212 }, // Luxembourg

  // ── Nordics ──────────────────────────────────────────────────────────────
  CPH: { lat: 55.618, lng: 12.656 }, // Copenhagen
  ARN: { lat: 59.652, lng: 17.919 }, // Stockholm
  OSL: { lat: 60.194, lng: 11.1 }, // Oslo
  HEL: { lat: 60.317, lng: 24.963 }, // Helsinki

  // ── Iberia ───────────────────────────────────────────────────────────────
  MAD: { lat: 40.472, lng: -3.561 }, // Madrid
  LIS: { lat: 38.781, lng: -9.136 }, // Lisbon

  // ── Italy (non-resort) ──────────────────────────────────────────────────
  FCO: { lat: 41.8, lng: 12.239 }, // Rome Fiumicino
  MXP: { lat: 45.63, lng: 8.723 }, // Milan Malpensa
  LIN: { lat: 45.449, lng: 9.278 }, // Milan Linate
  BGY: { lat: 45.669, lng: 9.7 }, // Milan Bergamo
  VCE: { lat: 45.505, lng: 12.352 }, // Venice

  // ── Eastern Europe ───────────────────────────────────────────────────────
  PRG: { lat: 50.101, lng: 14.26 }, // Prague
  VIE: { lat: 48.11, lng: 16.57 }, // Vienna
  WAW: { lat: 52.166, lng: 20.967 }, // Warsaw
  BUD: { lat: 47.439, lng: 19.262 }, // Budapest

  // ── US (major hubs) ─────────────────────────────────────────────────────
  JFK: { lat: 40.64, lng: -73.779 }, // New York JFK
  EWR: { lat: 40.692, lng: -74.169 }, // Newark
  LAX: { lat: 33.943, lng: -118.408 }, // Los Angeles
  SFO: { lat: 37.619, lng: -122.375 }, // San Francisco
  ORD: { lat: 41.978, lng: -87.904 }, // Chicago O'Hare
  DEN: { lat: 39.862, lng: -104.673 }, // Denver
  SEA: { lat: 47.449, lng: -122.309 }, // Seattle
  BOS: { lat: 42.365, lng: -71.01 }, // Boston
  DFW: { lat: 32.897, lng: -97.038 }, // Dallas
  ATL: { lat: 33.637, lng: -84.428 }, // Atlanta
  IAD: { lat: 38.945, lng: -77.456 }, // Washington Dulles
  MIA: { lat: 25.796, lng: -80.287 }, // Miami
  PHX: { lat: 33.437, lng: -112.008 }, // Phoenix
  MSP: { lat: 44.882, lng: -93.222 }, // Minneapolis
  DTW: { lat: 42.212, lng: -83.353 }, // Detroit

  // ── Canada ───────────────────────────────────────────────────────────────
  YYZ: { lat: 43.677, lng: -79.631 }, // Toronto
  YUL: { lat: 45.47, lng: -73.741 }, // Montreal
  YOW: { lat: 45.323, lng: -75.669 }, // Ottawa
  YYC: { lat: 51.114, lng: -114.02 }, // Calgary
  YEG: { lat: 53.31, lng: -113.58 }, // Edmonton

  // ── Middle East / Gulf ───────────────────────────────────────────────────
  DXB: { lat: 25.253, lng: 55.364 }, // Dubai
  DOH: { lat: 25.261, lng: 51.565 }, // Doha
  AUH: { lat: 24.433, lng: 54.651 }, // Abu Dhabi
  IST: { lat: 41.275, lng: 28.752 }, // Istanbul

  // ── Asia-Pacific ─────────────────────────────────────────────────────────
  NRT: { lat: 35.764, lng: 140.386 }, // Tokyo Narita
  HND: { lat: 35.553, lng: 139.78 }, // Tokyo Haneda
  SIN: { lat: 1.35, lng: 103.994 }, // Singapore
  HKG: { lat: 22.309, lng: 113.915 }, // Hong Kong
  SYD: { lat: -33.946, lng: 151.177 }, // Sydney
  MEL: { lat: -37.673, lng: 144.843 }, // Melbourne

  // ── South America ────────────────────────────────────────────────────────
  GRU: { lat: -23.432, lng: -46.47 }, // São Paulo
  EZE: { lat: -34.822, lng: -58.536 }, // Buenos Aires
};

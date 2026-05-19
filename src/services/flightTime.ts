/**
 * Estimates flight time between two airports using great-circle distance.
 * Returns null when coordinates are unavailable for either airport.
 */

import { AIRPORT_COORDS } from "@/data/airportCoordinates";

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_KM = 6371;
const AVERAGE_SPEED_KMH = 800;
const OVERHEAD_MINUTES = 30; // taxi, takeoff, approach

/**
 * Haversine distance between two points in kilometres.
 */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLng = (lng2 - lng1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) *
      Math.cos(lat2 * DEG_TO_RAD) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estimated flight time in minutes between two airports (IATA codes).
 * Returns `null` if either airport's coordinates are unknown.
 */
export function getFlightTimeMinutes(
  originIata: string,
  destIata: string,
): number | null {
  const from = AIRPORT_COORDS[originIata];
  const to = AIRPORT_COORDS[destIata];
  if (!from || !to) return null;
  const distKm = haversineKm(from.lat, from.lng, to.lat, to.lng);
  return Math.round(distKm / (AVERAGE_SPEED_KMH / 60) + OVERHEAD_MINUTES);
}

/**
 * Formats a flight time in minutes to a human-readable string.
 * e.g. 95 → "1h 35m", 45 → "45m"
 */
export function formatFlightTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

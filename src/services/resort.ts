import { resorts } from "@data/resorts";
import type { Resort } from "@/types/resort";

/**
 * Get all resorts.
 */
export function getAllResorts(): Resort[] {
  return resorts;
}

/**
 * Get a resort by ID.
 */
export function getResortById(id: string): Resort | undefined {
  return resorts.find((resort) => resort.id === id);
}

/**
 * Get resorts filtered by region.
 */
export function getResortsByRegion(regionIds: string[]): Resort[] {
  if (regionIds.length === 0) return resorts;

  const regionMap: Record<string, string[]> = {
    "france-alps": ["France"],
    austria: ["Austria"],
    switzerland: ["Switzerland"],
    italy: ["Italy"],
    "andorra-spain": ["Andorra", "Spain"],
  };

  const allowedCountries = regionIds.flatMap((id) => regionMap[id] || []);

  return resorts.filter((resort) => allowedCountries.includes(resort.country));
}

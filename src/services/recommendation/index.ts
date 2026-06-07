import { getResortsByRegionAsync } from "../resort";
import { calculateScores, computeWeightedScore } from "./scorer";
import { generateExplanations } from "./explainer";
import type {
  SkillLevel,
  Preferences,
  NormalizedPreferences,
} from "@/types/preferences";
import type { RecommendationResult } from "@/types/recommendation";
import {
  SKILL_LEVEL_MAP,
  BUDGET_LEVEL_MAP,
  DEFAULT_ABILITY,
} from "@/constants/options";
import {
  SEASONAL_WINDOW,
  RECOMMENDATION_LIMIT,
} from "@/constants/scoring";

/**
 * Normalize user preferences to 0-1 scale for scoring.
 */
function normalizePreferences(prefs: Preferences): NormalizedPreferences {
  const abilities =
    prefs.groupAbilities.length > 0
      ? prefs.groupAbilities
      : ([DEFAULT_ABILITY] as SkillLevel[]);

  const skillValues = abilities.map((s) => SKILL_LEVEL_MAP[s]);
  const minSkill = Math.min(...skillValues);
  const maxSkill = Math.max(...skillValues);

  return {
    minSkill,
    maxSkill,
    tripType: prefs.tripType,
    budgetLevel: BUDGET_LEVEL_MAP[prefs.budgetLevel] ?? 0.5,
    quietLively: (prefs.crowdPreference - 1) / 4,
    familyNightlife: (prefs.familyVsNightlife - 1) / 4,
    preferredMonths: prefs.preferredMonths,
    regions: prefs.regions,
    featurePreferences: prefs.featurePreferences ?? [],
  };
}

/**
 * Seasonal status label for UI display.
 */
export type SeasonalStatus = "open" | "caution" | "warning" | "closed";

const MS_PER_DAY = 86_400_000;

/**
 * Get the seasonal status for a resort based on its season end date.
 * Returns both the status label and days remaining.
 */
export function getSeasonalStatus(seasonEnd: string): {
  status: SeasonalStatus;
  daysRemaining: number;
} {
  const now = Date.now();
  const endMs = new Date(seasonEnd).getTime();
  const daysRemaining = Math.ceil((endMs - now) / MS_PER_DAY);

  let status: SeasonalStatus;
  if (daysRemaining < 0) status = "closed";
  else if (daysRemaining < SEASONAL_WINDOW.warning) status = "warning";
  else if (daysRemaining < SEASONAL_WINDOW.caution) status = "caution";
  else status = "open";

  return { status, daysRemaining };
}

/**
 * Get personalized resort recommendations based on user preferences.
 * Fetches resorts from cloud and scores them client-side.
 */
export async function getRecommendations(
  preferences: Preferences,
  limit: number = RECOMMENDATION_LIMIT,
  dismissedIds: string[] = [],
): Promise<RecommendationResult[]> {
  // 1. Fetch and filter by region (async)
  const allCandidates = await getResortsByRegionAsync(preferences.regions);

  // 2. Exclude resorts the user has dismissed this session
  const candidates = dismissedIds.length
    ? allCandidates.filter((r) => !dismissedIds.includes(r.id))
    : allCandidates;

  // 3. Normalize preferences
  const normalizedPrefs = normalizePreferences(preferences);

  // 4. Score each resort
  const scored: RecommendationResult[] = candidates.map((resort) => {
    const attributeScores = calculateScores(resort, normalizedPrefs);
    const matchScore = computeWeightedScore(attributeScores, normalizedPrefs, resort);
    const matchReasons = generateExplanations(
      resort,
      attributeScores,
      normalizedPrefs,
    );

    return {
      resort,
      matchScore,
      matchReasons,
      attributeScores,
    };
  });

  // 5. Sort by match score (descending) and return top N
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

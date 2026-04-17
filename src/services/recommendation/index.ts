import { getResortsByRegionAsync } from "../resort";
import { calculateScores, computeWeightedScore } from "./scorer";
import { generateExplanations } from "./explainer";
import type {
  SkillLevel,
  Preferences,
  NormalizedPreferences,
} from "@/types/preferences";
import type {
  RecommendationResult,
} from "@/types/recommendation";
import {
  SKILL_LEVEL_MAP,
  BUDGET_LEVEL_MAP,
  DEFAULT_ABILITY,
} from "@/constants/options";
import {
  MS_PER_DAY,
  SEASONAL_WINDOW,
  SEASONAL_PENALTY,
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
    snowImportance: (prefs.snowImportance - 1) / 4,
    regions: prefs.regions,
  };
}

/**
 * Compute a seasonal penalty multiplier based on how close the resort is to closing.
 * - Closed (past end date): SEASONAL_PENALTY.closed
 * - Within SEASONAL_WINDOW.warning days of closing: SEASONAL_PENALTY.warning
 * - Within SEASONAL_WINDOW.caution days of closing: SEASONAL_PENALTY.caution
 * - Otherwise: SEASONAL_PENALTY.open
 */
function seasonalMultiplier(seasonEnd: string): number {
  const now = Date.now();
  const endMs = new Date(seasonEnd).getTime();
  const daysUntilClose = (endMs - now) / MS_PER_DAY;

  if (daysUntilClose < 0) return SEASONAL_PENALTY.closed;
  if (daysUntilClose < SEASONAL_WINDOW.warning) return SEASONAL_PENALTY.warning;
  if (daysUntilClose < SEASONAL_WINDOW.caution) return SEASONAL_PENALTY.caution;
  return SEASONAL_PENALTY.open;
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
    const rawScore = computeWeightedScore(attributeScores, normalizedPrefs);
    const matchScore = Math.round(
      rawScore * seasonalMultiplier(resort.season.end),
    );
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

import { getResortsByRegion } from "../resort";
import { calculateScores } from "./scorer";
import { generateExplanations } from "./explainer";
import type { Preferences, NormalizedPreferences } from "@types/preferences";
import type {
  RecommendationResult,
  AttributeScores,
} from "@types/recommendation";

/**
 * Normalize user preferences to 0-1 scale for scoring.
 */
function normalizePreferences(prefs: Preferences): NormalizedPreferences {
  const skillMap: Record<string, number> = {
    beginner: 0,
    intermediate: 0.5,
    advanced: 1,
  };

  const budgetMap: Record<string, number> = {
    budget: 0,
    mid: 0.33,
    premium: 0.67,
    luxury: 1,
  };

  return {
    skillLevel: skillMap[prefs.skillLevel] ?? 0.5,
    budgetLevel: budgetMap[prefs.budgetLevel] ?? 0.5,
    quietLively: (prefs.crowdPreference - 1) / 4,
    familyNightlife: (prefs.familyVsNightlife - 1) / 4,
    snowImportance: (prefs.snowImportance - 1) / 4,
    regions: prefs.regions,
  };
}

/**
 * Compute weighted final match score from attribute scores.
 */
function computeWeightedScore(
  scores: AttributeScores,
  prefs: NormalizedPreferences,
): number {
  // Base weights (sum to 1.0)
  const weights = {
    skill: 0.3,
    budget: 0.25,
    vibe: 0.15,
    activity: 0.15,
    snow: 0.15,
  };

  // Adjust snow weight based on user's stated importance
  const snowMultiplier = 0.5 + prefs.snowImportance * 0.5;
  weights.snow *= snowMultiplier;

  // Renormalize weights to sum to 1
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach((key) => {
    weights[key as keyof typeof weights] /= totalWeight;
  });

  // Weighted sum
  return Math.round(
    scores.skill * weights.skill +
      scores.budget * weights.budget +
      scores.vibe * weights.vibe +
      scores.activity * weights.activity +
      scores.snow * weights.snow,
  );
}

/**
 * Get personalized resort recommendations based on user preferences.
 * Runs entirely client-side for offline support.
 */
export async function getRecommendations(
  preferences: Preferences,
  limit: number = 5,
): Promise<RecommendationResult[]> {
  // Simulate async for future API compatibility
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 1. Filter by region
  const candidates = getResortsByRegion(preferences.regions);

  // 2. Normalize preferences
  const normalizedPrefs = normalizePreferences(preferences);

  // 3. Score each resort
  const scored: RecommendationResult[] = candidates.map((resort) => {
    const attributeScores = calculateScores(resort, normalizedPrefs);
    const matchScore = computeWeightedScore(attributeScores, normalizedPrefs);
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

  // 4. Sort by match score (descending) and return top N
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

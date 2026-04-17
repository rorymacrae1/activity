import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";
import type { AttributeScores } from "@/types/recommendation";

/**
 * Get ideal terrain distribution for a given skill level.
 */
function getIdealDistribution(skill: number): {
  beginner: number;
  intermediate: number;
  advanced: number;
} {
  if (skill < 0.33) {
    // Beginner wants: more green/blue runs
    return { beginner: 50, intermediate: 40, advanced: 10 };
  } else if (skill < 0.67) {
    // Intermediate wants: balanced with emphasis on blues/reds
    return { beginner: 20, intermediate: 55, advanced: 25 };
  } else if (skill < 0.84) {
    // Red runner wants: strong reds with some blacks
    return { beginner: 10, intermediate: 35, advanced: 55 };
  } else {
    // Advanced wants: maximum challenging terrain
    return { beginner: 5, intermediate: 25, advanced: 70 };
  }
}

/**
 * Score how well a resort serves ONE ability level (0-100).
 */
function scoreForSkill(resort: Resort, skill: number): number {
  const ideal = getIdealDistribution(skill);
  const terrain = resort.terrain;
  const diff =
    Math.abs(terrain.beginner - ideal.beginner) * 0.3 +
    Math.abs(terrain.intermediate - ideal.intermediate) * 0.4 +
    Math.abs(terrain.advanced - ideal.advanced) * 0.3;
  return Math.max(0, Math.round(100 - diff));
}

/**
 * Calculate skill match score for a group (0-100).
 * 60% weight on serving the weakest member (accessibility),
 * 40% weight on serving the strongest member (ceiling/challenge).
 * For solo/couple (minSkill === maxSkill), this is identical to the previous behaviour.
 */
function calculateSkillScore(
  resort: Resort,
  prefs: NormalizedPreferences,
): number {
  const accessScore = scoreForSkill(resort, prefs.minSkill);
  const ceilingScore = scoreForSkill(resort, prefs.maxSkill);
  // Family trips: boost accessibility weight slightly
  const accessWeight = prefs.tripType === "family" ? 0.7 : 0.6;
  const ceilingWeight = 1 - accessWeight;
  return Math.round(accessScore * accessWeight + ceilingScore * ceilingWeight);
}

/**
 * Calculate budget match score (0-100).
 * Based on how well resort cost fits user's budget level.
 */
function calculateBudgetScore(resort: Resort, budgetLevel: number): number {
  const dailyCost = resort.attributes.averageDailyCost;

  // Budget ranges (EUR per day)
  const ranges = [
    { min: 0, max: 120, ideal: 80 }, // Budget
    { min: 100, max: 180, ideal: 140 }, // Mid
    { min: 160, max: 280, ideal: 220 }, // Premium
    { min: 250, max: 500, ideal: 350 }, // Luxury
  ];

  // Get user's target range based on budget level
  const index = Math.min(3, Math.floor(budgetLevel * 4));
  const range = ranges[index];

  if (dailyCost >= range.min && dailyCost <= range.max) {
    // Within range - score based on distance from ideal
    const distanceFromIdeal = Math.abs(dailyCost - range.ideal);
    const maxDistance = (range.max - range.min) / 2;
    return Math.round(100 - (distanceFromIdeal / maxDistance) * 30);
  } else if (dailyCost < range.min) {
    // Under budget - still good
    return 75;
  } else {
    // Over budget - penalize based on how much over
    const overAmount = dailyCost - range.max;
    return Math.max(20, Math.round(70 - (overAmount / 50) * 20));
  }
}

/**
 * Calculate vibe match score (0-100).
 * Based on crowd level preference.
 */
function calculateVibeScore(resort: Resort, quietLively: number): number {
  // crowdLevel: 1-5, quietLively: 0-1
  const normalizedCrowd = (resort.attributes.crowdLevel - 1) / 4;
  const diff = Math.abs(normalizedCrowd - quietLively);
  return Math.round(100 - diff * 100);
}

/**
 * Calculate activity match score (0-100).
 * Based on family vs nightlife preference.
 */
function calculateActivityScore(
  resort: Resort,
  familyNightlife: number,
): number {
  // familyNightlife: 0 = family, 1 = nightlife
  const familyWeight = 1 - familyNightlife;
  const nightlifeWeight = familyNightlife;

  const weightedScore =
    (resort.attributes.familyScore / 5) * familyWeight +
    (resort.attributes.nightlifeScore / 5) * nightlifeWeight;

  return Math.round(weightedScore * 100);
}

/**
 * Calculate snow reliability score (0-100).
 */
function calculateSnowScore(resort: Resort): number {
  // snowReliability is 1-5, scale to 0-100
  return resort.attributes.snowReliability * 20;
}

/**
 * Calculate all attribute scores for a resort.
 */
export function calculateScores(
  resort: Resort,
  prefs: NormalizedPreferences,
): AttributeScores {
  return {
    skill: calculateSkillScore(resort, prefs),
    budget: calculateBudgetScore(resort, prefs.budgetLevel),
    vibe: calculateVibeScore(resort, prefs.quietLively),
    activity: calculateActivityScore(resort, prefs.familyNightlife),
    snow: calculateSnowScore(resort),
  };
}

/**
 * Compute weighted final match score from attribute scores.
 * Snow weight scales with user's stated snow importance (0–1).
 * All weights are renormalized to sum to 1.
 */
export function computeWeightedScore(
  scores: AttributeScores,
  prefs: NormalizedPreferences,
): number {
  const weights = {
    skill: 0.3,
    budget: 0.25,
    vibe: 0.15,
    activity: 0.15,
    snow: 0.15,
  };

  // Scale snow weight by user preference importance
  weights.snow *= 0.5 + prefs.snowImportance * 0.5;

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  (Object.keys(weights) as (keyof typeof weights)[]).forEach((k) => {
    weights[k] /= totalWeight;
  });

  return Math.round(
    scores.skill * weights.skill +
      scores.budget * weights.budget +
      scores.vibe * weights.vibe +
      scores.activity * weights.activity +
      scores.snow * weights.snow,
  );
}

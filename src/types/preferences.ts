/**
 * Skill level for skiing ability.
 */
export type SkillLevel = "beginner" | "intermediate" | "advanced";

/**
 * Budget level for trip planning.
 */
export type BudgetLevel = "budget" | "mid" | "premium" | "luxury";

/**
 * User preferences from onboarding quiz.
 */
export interface Preferences {
  skillLevel: SkillLevel;
  budgetLevel: BudgetLevel;
  regions: string[];
  crowdPreference: number; // 1-5 (quiet to lively)
  familyVsNightlife: number; // 1-5 (family to nightlife)
  snowImportance: number; // 1-5
}

/**
 * Normalized preferences for scoring algorithm (0-1 scale).
 */
export interface NormalizedPreferences {
  skillLevel: number; // 0=beginner, 0.5=intermediate, 1=advanced
  budgetLevel: number; // 0=budget, 0.33=mid, 0.67=premium, 1=luxury
  quietLively: number; // 0=quiet, 1=lively
  familyNightlife: number; // 0=family, 1=nightlife
  snowImportance: number; // 0=not important, 1=critical
  regions: string[];
}

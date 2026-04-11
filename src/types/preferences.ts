export type SkillLevel =
  | "beginner"
  | "intermediate"
  | "red"
  | "advanced";
export type BudgetLevel = "budget" | "mid" | "premium" | "luxury";
export type TripType = "solo" | "couple" | "family" | "friends";

/**
 * User preferences from onboarding quiz.
 */
export interface Preferences {
  tripType: TripType | null;
  groupAbilities: SkillLevel[]; // one or more ability levels in the group
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
  minSkill: number; // 0=beginner, 0.33=intermediate, 0.67=red, 1=advanced
  maxSkill: number; // highest ability in group
  tripType: TripType | null;
  budgetLevel: number; // 0=budget, 0.33=mid, 0.67=premium, 1=luxury
  quietLively: number; // 0=quiet, 1=lively
  familyNightlife: number; // 0=family, 1=nightlife
  snowImportance: number; // 0=not important, 1=critical
  regions: string[];
}

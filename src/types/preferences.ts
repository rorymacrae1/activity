export type SkillLevel =
  | "beginner"
  | "intermediate"
  | "red"
  | "advanced";
export type BudgetLevel = "budget" | "mid" | "premium" | "luxury";
export type TripType = "solo" | "couple" | "family" | "friends";

/**
 * Optional resort feature preferences — soft boosts in the recommendation scorer.
 * Each key maps to a verifiable attribute on the Resort type.
 */
export type FeatureKey =
  | "ski_in_out"       // attributes.hasSkiInOut
  | "catered"          // attributes.hasCatered
  | "snow_park"        // stats.snowParks > 0
  | "train_accessible" // attributes.trainAccessible
  | "high_altitude"    // location.peakAltitude >= 2500
  | "off_piste"        // content.offPisteSummary exists
  | "family_friendly"  // attributes.familyScore >= 4
  | "lively_apres"     // attributes.nightlifeScore >= 4 OR barCount >= 15
  | "quiet_resort"     // attributes.crowdLevel <= 2
  | "glacier";         // location.peakAltitude >= 3000

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
  preferredMonths: number[]; // 1-12 month numbers
  featurePreferences: FeatureKey[]; // optional must-have feature boosts
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
  preferredMonths: number[]; // 1-12 month numbers
  regions: string[];
  featurePreferences: FeatureKey[]; // optional must-have feature boosts
}

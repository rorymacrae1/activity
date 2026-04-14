/**
 * Single source of truth for all enum-like option arrays and their
 * normalized (0–1) mappings. Import these instead of re-declaring
 * inline arrays or Record literals across components and services.
 */

import type { SkillLevel, BudgetLevel, TripType } from "@/types/preferences";

/** Ordered skill levels from least to most advanced. */
export const SKILL_LEVELS: SkillLevel[] = [
  "beginner",
  "intermediate",
  "red",
  "advanced",
];

/**
 * Normalized 0–1 value for each skill level.
 * 0 = beginner, 0.33 = intermediate, 0.67 = red, 1 = advanced.
 */
export const SKILL_LEVEL_MAP: Record<SkillLevel, number> = {
  beginner: 0,
  intermediate: 0.33,
  red: 0.67,
  advanced: 1,
};

/** Fallback ability used when no group abilities are stored. */
export const DEFAULT_ABILITY: SkillLevel = "intermediate";

/** Ordered budget levels from cheapest to most expensive. */
export const BUDGET_LEVELS: BudgetLevel[] = [
  "budget",
  "mid",
  "premium",
  "luxury",
];

/**
 * Normalized 0–1 value for each budget level.
 * 0 = budget, 0.33 = mid, 0.67 = premium, 1 = luxury.
 */
export const BUDGET_LEVEL_MAP: Record<BudgetLevel, number> = {
  budget: 0,
  mid: 0.33,
  premium: 0.67,
  luxury: 1,
};

/** All supported trip types. */
export const TRIP_TYPES: TripType[] = ["solo", "couple", "family", "friends"];

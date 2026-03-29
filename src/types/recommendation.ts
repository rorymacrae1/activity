import type { Resort } from "./resort";

/**
 * Individual attribute scores (0-100).
 */
export interface AttributeScores {
  skill: number;
  budget: number;
  vibe: number;
  activity: number;
  snow: number;
}

/**
 * Result from recommendation engine.
 */
export interface RecommendationResult {
  resort: Resort;
  matchScore: number; // 0-100
  matchReasons: string[]; // Human-readable explanations
  attributeScores: AttributeScores;
}

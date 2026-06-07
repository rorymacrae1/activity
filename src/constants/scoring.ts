/**
 * Scoring algorithm constants — thresholds, penalties, and timing values.
 * Import these instead of using inline magic numbers.
 */

/**
 * Score tier thresholds (0–100 scale).
 * Used by the explainer, PCA chart colour coding, and match breakdown labels.
 */
export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
} as const;

/**
 * How many days before season end to flag seasonal proximity in UI.
 */
export const SEASONAL_WINDOW = {
  /** Flag as warning within this many days of closing. */
  warning: 14,
  /** Flag as caution within this many days of closing. */
  caution: 28,
} as const;

/** Default number of recommendations returned. */
export const RECOMMENDATION_LIMIT = 5;

/**
 * Phase transition times (ms) for the results loading screen.
 * Each value is when the next message appears after the fetch starts.
 */
export const LOADING_PHASE_TIMES = [3_000, 7_000, 10_000] as const;

/** Fetch timeout for recommendation requests (ms). */
export const RECOMMENDATION_TIMEOUT_MS = 12_000;

/** General screen data-load timeout (ms). */
export const LOAD_TIMEOUT_MS = 10_000;

/** Delay before showing slow-load reassurance message in LoadingState (ms). */
export const SLOW_LOAD_THRESHOLD_MS = 5_000;

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
 * How many days before season end to apply a seasonal penalty.
 */
export const SEASONAL_WINDOW = {
  /** Apply SEASONAL_PENALTY.warning within this many days of closing. */
  warning: 14,
  /** Apply SEASONAL_PENALTY.caution within this many days of closing. */
  caution: 28,
} as const;

/**
 * Multipliers applied to the match score based on season proximity.
 * Closed = 0.3 (heavily deprioritised), open = 1.0 (no penalty).
 */
export const SEASONAL_PENALTY = {
  closed: 0.3,
  warning: 0.6,
  caution: 0.8,
  open: 1.0,
} as const;

/** Milliseconds in one day — used for season proximity calculation. */
export const MS_PER_DAY = 86_400_000;

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

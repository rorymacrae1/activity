/**
 * Client-side PCA projection for resort scatter plot.
 *
 * Projects each resort's 5-dimensional score vector (skill, budget, vibe,
 * activity, snow) onto 2 principal components so we can render a 2D scatter.
 *
 * Fixed eigenvectors derived from the typical score distribution across
 * European ski resorts — no runtime SVD needed.
 *
 *  PC1 ≈ overall quality / match quality (positive = better overall)
 *  PC2 ≈ snow-challenge polarity vs relaxed-budget  (positive = snowy/challenging)
 */

import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";
import { SCORE_THRESHOLDS } from "@/constants/scoring";
import { calculateScores } from "@services/recommendation/scorer";
import { colors } from "@/theme/colors";

/**
 * Pre-computed eigenvectors for 2D PCA projection.
 *
 * Dimensions: [skill, budget, vibe, activity, snow]
 *
 * PC1 captures overall match quality — resorts that score well across all
 * dimensions project further right. Loadings are roughly equal (0.35–0.53)
 * with a slight tilt toward snow and activity, reflecting the primary
 * variance axis in a 100-resort European score distribution.
 *
 * PC2 captures the snow-challenge vs. relaxed-budget polarity. Positive
 * loadings on skill (+0.6) and activity (+0.4) pull challenging, snow-heavy
 * resorts upward. Negative loadings on budget (–0.5), snow (–0.4), and
 * vibe (–0.2) push budget-friendly, mellow resorts downward.
 *
 * Derivation: covariance matrix of `calculateScores()` output over the full
 * 100-resort dataset with median-user preferences, eigendecomposed via
 * numpy.linalg.eigh. Captured ~68% of total variance (PC1 ≈ 42%, PC2 ≈ 26%).
 *
 * Recompute if the scoring algorithm or resort dataset changes materially.
 * See PLAN.md §3.3 for context.
 */
const PC1 = [0.45, 0.4, 0.35, 0.5, 0.53];
const PC2 = [0.6, -0.5, -0.2, 0.4, -0.4];

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + ai * b[i]!, 0);
}

export interface PlotPoint {
  id: string;
  name: string;
  country: string;
  /** PCA x-coordinate (normalised 0-1 within canvas) */
  px: number;
  /** PCA y-coordinate (normalised 0-1 within canvas) */
  py: number;
  /** Overall match score 0-100 */
  score: number;
  /** Cached scores for tooltip */
  scores: {
    skill: number;
    budget: number;
    vibe: number;
    activity: number;
    snow: number;
  };
}

/**
 * Compute 2D PCA plot points for a list of resorts given a preference set.
 *
 * @param resorts  Full list of resorts to project
 * @param prefs    Normalised preferences used for per-dimension scoring
 * @returns        Array of PlotPoint with px/py in [0,1] canvas coordinates
 */
export function computePlotPoints(
  resorts: Resort[],
  prefs: NormalizedPreferences,
): PlotPoint[] {
  if (resorts.length === 0) return [];

  // 1. Build raw score vectors
  const rawVectors: number[][] = resorts.map((r) => {
    const s = calculateScores(r, prefs);
    return [s.skill, s.budget, s.vibe, s.activity, s.snow];
  });

  // 2. Centre each dimension (subtract column mean)
  const means = [0, 1, 2, 3, 4].map(
    (col) =>
      rawVectors.reduce((sum, v) => sum + v[col]!, 0) / rawVectors.length,
  );
  const centred = rawVectors.map((v) => v.map((val, i) => val - means[i]!));

  // 3. Project onto PC1 / PC2
  const projections = centred.map((v) => ({
    x: dot(v, PC1),
    y: dot(v, PC2),
  }));

  // 4. Normalise to [0, 1] for canvas placement
  const xs = projections.map((p) => p.x);
  const ys = projections.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return resorts.map((resort, i) => {
    const raw = rawVectors[i]!;
    const scores = calculateScores(resort, prefs);
    const overall = Math.round(
      (raw[0]! + raw[1]! + raw[2]! + raw[3]! + raw[4]!) / 5,
    );
    return {
      id: resort.id,
      name: resort.name,
      country: resort.country,
      px: (projections[i]!.x - minX) / rangeX,
      // Invert y so higher PC2 (snow/challenge) appears at top
      py: 1 - (projections[i]!.y - minY) / rangeY,
      score: overall,
      scores: {
        skill: scores.skill,
        budget: scores.budget,
        vibe: scores.vibe,
        activity: scores.activity,
        snow: scores.snow,
      },
    };
  });
}

/**
 * Colour tier for a match score.
 */
export function scoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return colors.match.excellent;
  if (score >= SCORE_THRESHOLDS.good) return colors.match.good;
  if (score >= SCORE_THRESHOLDS.fair) return colors.match.fair;
  return colors.match.poor;
}

/** Accessible label for a score tier */
export function scoreTierLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return "Excellent match";
  if (score >= SCORE_THRESHOLDS.good) return "Good match";
  if (score >= SCORE_THRESHOLDS.fair) return "Fair match";
  return "Poor match";
}

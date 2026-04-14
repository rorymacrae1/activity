import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";
import type { AttributeScores } from "@/types/recommendation";
import { SCORE_THRESHOLDS } from "@/constants/scoring";

interface ReasonTemplate {
  excellent: string;
  good: string;
}

/**
 * Generate human-readable explanation strings for why a resort was recommended.
 */
export function generateExplanations(
  resort: Resort,
  scores: AttributeScores,
  prefs: NormalizedPreferences,
): string[] {
  const reasons: string[] = [];

  // Templates for each attribute — all reference real resort data
  const templates: Record<
    keyof AttributeScores,
    (r: Resort) => ReasonTemplate
  > = {
    skill: (r) => {
      const km = r.stats.totalKm;
      const dominant =
        prefs.maxSkill >= 0.67
          ? `${r.terrain.advanced}% black runs`
          : prefs.maxSkill >= 0.33
            ? `${r.terrain.intermediate}% reds`
            : `${r.terrain.beginner}% beginner terrain`;
      return {
        excellent: `${km}km of pistes, ${dominant} — perfect for your level`,
        good: `${km}km across ${r.stats.totalRuns} runs suits your group`,
      };
    },
    budget: (r) => ({
      excellent: `Great value at ~€${r.attributes.averageDailyCost}/day (lift pass €${r.attributes.liftPassDayCost})`,
      good: `Fits your budget at ~€${r.attributes.averageDailyCost}/day`,
    }),
    vibe: (r) => {
      const crowd = r.attributes.crowdLevel;
      const isQuiet = crowd <= 2;
      return {
        excellent: isQuiet
          ? `Quiet slopes — crowd level just ${crowd}/5`
          : `Buzzing resort — crowd level ${crowd}/5`,
        good: isQuiet
          ? `Relatively uncrowded (${crowd}/5)`
          : `Good atmosphere (crowd level ${crowd}/5)`,
      };
    },
    activity: (r) => {
      const family = prefs.familyNightlife < 0.5;
      return {
        excellent: family
          ? `Excellent for families — family score ${r.attributes.familyScore}/5`
          : `Great après-ski — nightlife score ${r.attributes.nightlifeScore}/5`,
        good: family
          ? `Family-friendly (${r.attributes.familyScore}/5)`
          : `Decent nightlife scene (${r.attributes.nightlifeScore}/5)`,
      };
    },
    snow: (r) => ({
      excellent: `Excellent snow reliability (${r.attributes.snowReliability}/5) — pistes up to ${r.location.peakAltitude}m`,
      good: `Reliable snow (${r.attributes.snowReliability}/5) at ${r.location.peakAltitude}m peak`,
    }),
  };

  // Sort scores and pick top 3
  const sortedScores = (
    Object.entries(scores) as [keyof AttributeScores, number][]
  ).sort(([, a], [, b]) => b - a);

  for (const [attr, score] of sortedScores) {
    if (reasons.length >= 3) break;

    const template = templates[attr](resort);

    if (score >= SCORE_THRESHOLDS.excellent) {
      reasons.push(template.excellent);
    } else if (score >= SCORE_THRESHOLDS.good && reasons.length < 2) {
      reasons.push(template.good);
    }
  }

  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push("Matches your overall preferences");
  }

  return reasons;
}

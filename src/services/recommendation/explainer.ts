import type { Resort } from "@types/resort";
import type { NormalizedPreferences } from "@types/preferences";
import type { AttributeScores } from "@types/recommendation";

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

  // Templates for each attribute
  const templates: Record<
    keyof AttributeScores,
    (r: Resort) => ReasonTemplate
  > = {
    skill: () => ({
      excellent: "Perfect terrain mix for your skill level",
      good: "Good variety of runs for you",
    }),
    budget: (r) => ({
      excellent: `Fits your budget at ~€${r.attributes.averageDailyCost}/day`,
      good: "Reasonable value for money",
    }),
    vibe: (r) => ({
      excellent:
        r.attributes.crowdLevel <= 2
          ? "Peaceful slopes you're looking for"
          : "Vibrant atmosphere you'll love",
      good: "Good crowd levels",
    }),
    activity: (_r) => ({
      excellent:
        prefs.familyNightlife < 0.5
          ? "Excellent for families"
          : "Great après-ski scene",
      good:
        prefs.familyNightlife < 0.5
          ? "Family-friendly options"
          : "Decent nightlife",
    }),
    snow: (r) => ({
      excellent: `Excellent snow reliability (${r.attributes.snowReliability}/5)`,
      good: "Reliable snow conditions",
    }),
  };

  // Sort scores and pick top 3
  const sortedScores = (
    Object.entries(scores) as [keyof AttributeScores, number][]
  ).sort(([, a], [, b]) => b - a);

  for (const [attr, score] of sortedScores) {
    if (reasons.length >= 3) break;

    const template = templates[attr](resort);

    if (score >= 80) {
      reasons.push(template.excellent);
    } else if (score >= 65 && reasons.length < 2) {
      reasons.push(template.good);
    }
  }

  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push("Matches your overall preferences");
  }

  return reasons;
}

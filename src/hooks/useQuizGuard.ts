import { useEffect } from "react";
import { router } from "expo-router";
import { usePreferencesStore } from "@/stores/preferences";

/**
 * Redirects to the onboarding intro if the user hasn't started the quiz.
 * Use on mid-flow screens (skill, budget, region, vibes) to prevent
 * deep-linking into a partially-complete questionnaire.
 * @returns true if redirecting (caller should render null to avoid flash)
 */
export function useQuizGuard(): boolean {
  const tripType = usePreferencesStore((s) => s.tripType);

  useEffect(() => {
    if (tripType === null) {
      router.replace("/(onboarding)");
    }
  }, [tripType]);

  return tripType === null;
}

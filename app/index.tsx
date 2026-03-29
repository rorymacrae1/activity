import { Redirect } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";

/**
 * Entry point - redirects to onboarding or main based on completion status.
 */
export default function Index() {
  const hasCompletedOnboarding = usePreferencesStore(
    (state) => state.hasCompletedOnboarding,
  );

  if (hasCompletedOnboarding) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(onboarding)" />;
}

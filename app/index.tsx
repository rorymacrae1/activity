import { Redirect } from "expo-router";
import { Platform } from "react-native";

/**
 * Entry point — always starts with the questionnaire.
 *
 * The onboarding/quiz flow is the primary landing experience.
 * Users who have completed it before will see the results screen
 * immediately (it loads their stored preferences).
 * The dashboard is accessible from the results screen or via tabs.
 *
 * On web refresh, if the URL points at a nested route, honour it
 * so the user stays on the page they were viewing.
 */
export default function Index() {
  // On web, honour the current URL for deep links / refresh
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path && path !== "/" && path !== "/index") {
      return <Redirect href={path as never} />;
    }
  }

  // Default: always start with the questionnaire
  return <Redirect href="/(onboarding)" />;
}

import { Stack } from "expo-router";
import { colors } from "@theme";

/**
 * Auth screens layout.
 * Contains sign-in, sign-up, and forgot-password screens.
 * Shows a minimal header with back navigation.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerBackTitle: "Back",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.canvas.default },
        headerTintColor: colors.ink.normal,
        contentStyle: { backgroundColor: colors.canvas.default },
        animation: "fade",
      }}
    />
  );
}

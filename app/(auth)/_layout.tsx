import { Stack } from "expo-router";
import { colors } from "@theme";

/**
 * Auth screens layout.
 * Contains sign-in and sign-up screens.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas.default },
        animation: "fade",
      }}
    />
  );
}

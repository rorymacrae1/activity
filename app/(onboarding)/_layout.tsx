import { Stack } from "expo-router";
import { colors } from "@/theme";

/**
 * Layout for onboarding flow.
 * Uses native slide transition for seamless forward/backward navigation.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        // Prevent white flash between screens
        contentStyle: { backgroundColor: colors.canvas.default },
        // Smooth animation timing
        animationDuration: 350,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="trip-type" />
      <Stack.Screen name="skill" />
      <Stack.Screen name="budget" />
      <Stack.Screen name="region" />
      <Stack.Screen name="vibes" />
      <Stack.Screen name="results" />
    </Stack>
  );
}

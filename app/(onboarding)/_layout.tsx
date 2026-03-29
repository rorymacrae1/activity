import { Stack } from "expo-router";

/**
 * Layout for onboarding flow.
 * Prevents going back with gestures and hides header.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="skill" />
      <Stack.Screen name="budget" />
      <Stack.Screen name="region" />
      <Stack.Screen name="vibes" />
      <Stack.Screen name="results" />
    </Stack>
  );
}

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

/**
 * Root layout component for the app.
 * Sets up navigation stack and global providers.
 */
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#f8fafc" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="(onboarding)"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="(main)" options={{ gestureEnabled: false }} />
        </Stack>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

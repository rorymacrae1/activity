import { Stack } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { ErrorBoundary } from "@components/ui/ErrorBoundary";

/**
 * Root layout component for the app.
 * Sets up navigation stack and global providers.
 * Head.Provider enables react-helmet-async for web SEO meta tags.
 */
export default function RootLayout() {
  return (
    <Head.Provider>
      <ErrorBoundary>
        <GestureHandlerRootView style={styles.container}>
          <Head>
            <title>PeakWise | Find Your Perfect Ski Resort</title>
            <meta
              name="description"
              content="Discover your ideal ski resort based on your skill level, budget, and preferences. Personalised recommendations for skiers and snowboarders."
            />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#1a365d" />
            <meta charSet="utf-8" />
            <meta property="og:site_name" content="PeakWise" />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
          </Head>
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
    </Head.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


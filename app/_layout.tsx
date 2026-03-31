import { Stack } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, Platform } from "react-native";
import { ErrorBoundary } from "@components/ui/ErrorBoundary";
import { maxContentWidth } from "@theme/layout";
import { colors } from "@theme";

/**
 * Root layout component for the app.
 * Sets up navigation stack and global providers.
 * Head.Provider enables react-helmet-async for web SEO meta tags.
 */
export default function RootLayout() {
  const isWeb = Platform.OS === "web";

  return (
    <Head.Provider>
      <ErrorBoundary>
        <GestureHandlerRootView style={styles.container}>
          <Head>
            <title>PisteWise | Find Your Perfect Ski Resort</title>
            <meta
              name="description"
              content="Discover your ideal ski resort based on your skill level, budget, and preferences. Personalised recommendations for skiers and snowboarders."
            />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta name="theme-color" content="#4E9085" />
            <meta charSet="utf-8" />
            <meta property="og:site_name" content="PisteWise" />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
          </Head>
          <StatusBar style="light" />
          {/* App shell with max-width on web */}
          <View style={[styles.appShell, isWeb && styles.appShellWeb]}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.canvas.default },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen
                name="(onboarding)"
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen name="(main)" options={{ gestureEnabled: false }} />
            </Stack>
          </View>
        </GestureHandlerRootView>
      </ErrorBoundary>
    </Head.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas.muted, // Visible behind app shell on ultra-wide
  },
  appShell: {
    flex: 1,
  },
  appShellWeb: {
    maxWidth: maxContentWidth.app,
    width: "100%",
    alignSelf: "center",
    // Subtle shadow on ultra-wide screens
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
});

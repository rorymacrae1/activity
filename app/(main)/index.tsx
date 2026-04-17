/**
 * Personalised Home Screen
 * Shows personalized content for authenticated users based on their profile
 */

import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore, useProfile, useIsAuthenticated } from "@stores/auth";
import { useFavoritesStore } from "@stores/favorites";
import {
  getProfileCompletionStatus,
  type ProfileCompletionStatus,
} from "@services/profile";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing } from "@theme";
import { LoadingState } from "@components/ui/LoadingState";
import { NavBar } from "@components/ui/NavBar";
import {
  WelcomeHero,
  QuickActions,
  FavoritesPreview,
  FavoritesBasedRecommendations,
  ProfileCompletionCard,
} from "@components/home";

export default function PersonalizedHomeScreen() {
  const { user, isLoading: authLoading } = useAuthStore();
  const profile = useProfile();
  const isAuthenticated = useIsAuthenticated();
  const { favoriteIds } = useFavoritesStore();
  const { hPadding } = useLayout();

  const [completionStatus, setCompletionStatus] =
    useState<ProfileCompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Get first name from profile or email - clean up formatting
  const rawName =
    profile?.display_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";
  // Capitalize and remove underscores for friendly display
  const firstName = rawName
    .replace(/_/g, " ")
    .split(" ")[0]
    .replace(/^\w/, (c) => c.toUpperCase());

  // Load profile completion status
  useEffect(() => {
    async function loadStatus() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const status = await getProfileCompletionStatus(
          user.id,
          favoriteIds.length,
        );
        setCompletionStatus(status);
      } catch {
        // Completion status is non-critical; degrade gracefully
        setCompletionStatus(null);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, [user, favoriteIds.length]);

  // Redirect non-authenticated users to onboarding
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/(onboarding)");
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <LoadingState message="Loading your dashboard..." />
      </SafeAreaView>
    );
  }

  // Safety check - should not happen due to redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  const showCompletionCard = completionStatus && !completionStatus.isComplete;
  const topFavoriteId = favoriteIds[0];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Head>
        <title>Home | PisteWise</title>
        <meta
          name="description"
          content="Your personalised ski resort dashboard with recommendations and favorites."
        />
      </Head>

      <NavBar />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: hPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Hero with stats */}
        <WelcomeHero
          firstName={firstName}
          favoritesCount={favoriteIds.length}
          profileComplete={completionStatus?.isComplete ?? false}
        />

        {/* Quick Actions */}
        <QuickActions showCompleteProfile={showCompletionCard ?? false} />

        {/* Profile completion nudge */}
        {showCompletionCard && completionStatus && (
          <ProfileCompletionCard
            completionPercentage={completionStatus.completionPercentage}
            missing={{
              homeAirport: !completionStatus.hasHomeAirport,
              visitedResorts: !completionStatus.hasVisitedResorts,
              favorites: !completionStatus.hasFavorites,
            }}
          />
        )}

        {/* Favorites Preview */}
        <FavoritesPreview favoriteIds={favoriteIds} />

        {/* Personalized Recommendations - show if has favorites */}
        {topFavoriteId && (
          <View style={styles.recommendationsSection}>
            <FavoritesBasedRecommendations
              baseResortId={topFavoriteId}
              heading="Resorts You'll Love"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  recommendationsSection: {
    marginTop: spacing.md,
  },
});

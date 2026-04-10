/**
 * Personalised Home Screen
 * Shows personalized content for authenticated users based on their profile
 */

import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
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
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { LoadingState } from "@components/ui/LoadingState";
import { Card } from "@components/ui/Card";
import { NavBar } from "@components/ui/NavBar";
import {
  ProfileCompletionCard,
  FavoritesBasedRecommendations,
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

  // Get first name from profile or email
  const firstName =
    profile?.display_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  // Load profile completion status
  useEffect(() => {
    async function loadStatus() {
      if (!user) {
        setLoading(false);
        return;
      }
      const status = await getProfileCompletionStatus(
        user.id,
        favoriteIds.length,
      );
      setCompletionStatus(status);
      setLoading(false);
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
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text variant="h1" style={styles.welcomeText}>
            Welcome{"\n"}
            {firstName}
          </Text>
        </View>

        {/* Dashboard Section */}
        <View style={styles.dashboardSection}>
          <Text variant="h2" style={styles.sectionTitle}>
            Dashboard
          </Text>

          {/* Profile Completion Card - show if incomplete */}
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

          {/* Favorites-based recommendations - show if has favorites */}
          {topFavoriteId && (
            <FavoritesBasedRecommendations baseResortId={topFavoriteId} />
          )}

          {/* Empty state if no favorites and profile is complete */}
          {!topFavoriteId && completionStatus?.isComplete && (
            <Card elevation="subtle" style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>❤️</Text>
              <Text variant="h3" style={styles.emptyTitle}>
                No Favorites Yet
              </Text>
              <Text
                variant="body"
                color={colors.text.secondary}
                style={styles.emptyText}
              >
                Save resorts you love to get personalized recommendations here.
              </Text>
              <Pressable
                style={styles.browseButton}
                onPress={() => router.push("/(onboarding)/results")}
                accessibilityRole="button"
              >
                <Text style={styles.browseButtonText}>Browse Resorts</Text>
              </Pressable>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  welcomeSection: {
    paddingVertical: spacing.lg,
  },
  welcomeText: {
    fontSize: 32,
    lineHeight: 40,
  },
  dashboardSection: {
    gap: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  browseButtonText: {
    color: colors.text.inverse,
    fontWeight: "600",
  },
});

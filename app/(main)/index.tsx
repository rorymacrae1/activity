/**
 * Personalised Home Screen
 * Shows personalized content for authenticated users based on their profile
 */

import { useEffect, useState } from "react";
import { View, ScrollView, Platform } from "react-native";
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
  const { hPadding, isTablet, isDesktop } = useLayout();

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
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.canvas.default }} edges={["top"]}>
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.canvas.default }} edges={["top"]}>
      <Head>
        <title>Home | PisteWise</title>
        <meta
          name="description"
          content="Your personalised ski resort dashboard with recommendations and favorites."
        />
      </Head>

      <NavBar />

      <ScrollView
        className="flex-1"
        contentContainerStyle={[
          { paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
          { paddingHorizontal: hPadding },
        ]}
        showsVerticalScrollIndicator={Platform.OS !== "web"}
      >
        {/* Welcome Hero with stats — full width always */}
        <WelcomeHero
          firstName={firstName}
          favoritesCount={favoriteIds.length}
          profileCompletionPercentage={
            completionStatus?.completionPercentage ?? 0
          }
        />

        {/* On tablet/desktop: 2-col grid for actions + completion */}
        {isTablet ? (
          <View className="flex-row" style={{ gap: spacing.lg, marginTop: spacing.md }}>
            <View className="flex-1">
              <QuickActions showCompleteProfile={false} />
            </View>
            {showCompletionCard && completionStatus ? (
              <View className="flex-1">
                <ProfileCompletionCard
                  completionPercentage={completionStatus.completionPercentage}
                  missing={{
                    homeAirport: !completionStatus.hasHomeAirport,
                    visitedResorts: !completionStatus.hasVisitedResorts,
                    favorites: !completionStatus.hasFavorites,
                  }}
                />
              </View>
            ) : (
              <View className="flex-1" />
            )}
          </View>
        ) : (
          <>
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
          </>
        )}

        {/* Favorites Preview */}
        <FavoritesPreview favoriteIds={favoriteIds} />

        {/* Personalized Recommendations - show if has favorites */}
        {topFavoriteId && (
          <View
            style={{ marginTop: isDesktop ? spacing.xl : spacing.md }}
          >
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

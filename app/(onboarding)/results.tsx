/**
 * Results Screen - Displays personalized ski resort recommendations
 *
 * Layout:
 * 1. TopPickHero - Featured top match (non-clickable)
 * 2. ReasonCarousel - Why it fits your criteria
 * 3. SecondChoicesCarousel - Runner-up options
 * 4. Decision Flow CTA - Link to visualization
 */

import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { getRecommendations } from "@services/recommendation";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { LoadingState } from "@components/ui/LoadingState";
import { EmptyState } from "@components/ui/EmptyState";
import { ScreenContainer } from "@components/ui/ScreenContainer";
import {
  TopPickHero,
  ReasonCarousel,
  SecondChoicesCarousel,
} from "@/components/results";
import type { RecommendationResult } from "@/types/recommendation";

export default function ResultsScreen() {
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { hPadding } = useLayout();
  const content = useContent();

  useEffect(() => {
    // Get preferences snapshot once on mount (not as a reactive selector)
    const preferences = usePreferencesStore.getState().getPreferencesInput();
    const setHasCompletedOnboarding =
      usePreferencesStore.getState().setHasCompletedOnboarding;

    getRecommendations(preferences)
      .then((r) => {
        setResults(r);
        setHasCompletedOnboarding(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message={content.onboarding.results.loading} />
      </ScreenContainer>
    );
  }

  // Empty state
  if (results.length === 0) {
    return (
      <ScreenContainer>
        <Head>
          <title>Your Top Ski Matches | PisteWise</title>
          <meta
            name="description"
            content="Your personalised ski resort recommendations are ready. Explore your top matches."
          />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <EmptyState
          icon="🤔"
          title={content.onboarding.results.emptyTitle}
          message={content.onboarding.results.emptyMessage}
          action={{
            label: content.onboarding.results.retake,
            onPress: () => router.replace("/(onboarding)"),
          }}
        />
      </ScreenContainer>
    );
  }

  // Split results: top pick vs runner-ups
  const topPick = results[0];
  const runnerUps = results.slice(1);

  // Compute sibling IDs for compare section
  const siblingIds = runnerUps.map((r) => r.resort.id);

  /** Navigate to resort detail with sibling IDs */
  const handleTopPickPress = () => {
    router.push({
      pathname: "/(main)/resort/[id]",
      params: {
        id: topPick.resort.id,
        ...(siblingIds.length > 0 && { siblingIds: siblingIds.join(",") }),
      },
    });
  };

  return (
    <ScreenContainer noMaxWidth>
      <Head>
        <title>Your Top Ski Matches | PisteWise</title>
        <meta
          name="description"
          content="Your personalised ski resort recommendations are ready. Explore your top matches."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: hPadding }]}>
          <View style={styles.headerContent}>
            <Text variant="h1">{content.onboarding.results.title}</Text>
            <Text variant="body" color={colors.text.secondary}>
              {content.onboarding.results.subtitle}
            </Text>
          </View>
          <Button
            label={content.onboarding.results.retake}
            variant="ghost"
            size="compact"
            onPress={() => router.replace("/(onboarding)")}
          />
        </View>

        {/* Top Pick Hero */}
        <View style={styles.topPickSection}>
          <TopPickHero result={topPick} onPress={handleTopPickPress} />
        </View>

        {/* Why It Fits Section */}
        <ReasonCarousel
          attributeScores={topPick.attributeScores}
          heading="Here's why it fits your criteria"
        />

        {/* Runner-ups Section */}
        {runnerUps.length > 0 && (
          <SecondChoicesCarousel
            results={runnerUps}
            heading="Close Second Choices"
            maxResults={10}
          />
        )}

        {/* Decision Flow CTA */}
        <Pressable
          style={styles.decisionFlowCta}
          onPress={() => router.push("/(onboarding)/decision-flow")}
          accessibilityRole="button"
          accessibilityLabel="Want to know how this was chosen? Tap to see the decision flow visualization"
        >
          <View style={styles.decisionFlowIcon}>
            <Text style={styles.decisionFlowEmoji}>🔍</Text>
          </View>
          <View style={styles.decisionFlowContent}>
            <Text style={styles.decisionFlowTitle}>
              Want to know how this was chosen?
            </Text>
            <Text style={styles.decisionFlowSubtitle}>
              See how your preferences led to this recommendation
            </Text>
          </View>
          <Text style={styles.decisionFlowArrow}>→</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerContent: {
    flex: 1,
    gap: spacing.xxs,
  },
  topPickSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  decisionFlowCta: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  decisionFlowIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  decisionFlowEmoji: {
    fontSize: 24,
  },
  decisionFlowContent: {
    flex: 1,
  },
  decisionFlowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  decisionFlowSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  decisionFlowArrow: {
    fontSize: 20,
    color: colors.brand.primary,
    marginLeft: spacing.sm,
  },
});

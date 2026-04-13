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
import { NavBar } from "@components/ui/NavBar";
import { Search } from "lucide-react-native";
import {
  TopPickHero,
  ReasonCarousel,
  SecondChoicesCarousel,
} from "@/components/results";
import type { RecommendationResult } from "@/types/recommendation";

export default function ResultsScreen() {
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const { hPadding } = useLayout();
  const content = useContent();

  const LOADING_PHASES = [
    content.onboarding.results.loading,
    "Scoring resorts against your preferences…",
    "Almost there, finding your best matches…",
    "Taking a little longer than usual…",
  ];

  const runRecommendations = () => {
    setLoading(true);
    setTimedOut(false);
    setResults([]);
    setLoadingPhase(0);

    const preferences = usePreferencesStore.getState().getPreferencesInput();
    const setHasCompletedOnboarding =
      usePreferencesStore.getState().setHasCompletedOnboarding;

    const deadline = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 12000),
    );

    Promise.race([getRecommendations(preferences), deadline])
      .then((r) => {
        setResults(r);
        if (r.length > 0) setHasCompletedOnboarding(true);
      })
      .catch((err: Error) => {
        if (err?.message === "timeout") setTimedOut(true);
        setResults([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runRecommendations();
  }, []);

  // Advance loading phase messages over time
  useEffect(() => {
    if (!loading) return;
    const timers = [
      setTimeout(() => setLoadingPhase(1), 3000),
      setTimeout(() => setLoadingPhase(2), 7000),
      setTimeout(() => setLoadingPhase(3), 10000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  if (loading) {
    return (
      <ScreenContainer>
        <NavBar />
        <LoadingState message={LOADING_PHASES[loadingPhase]} />
      </ScreenContainer>
    );
  }

  // Timeout or error state
  if (timedOut) {
    return (
      <ScreenContainer>
        <NavBar />
        <EmptyState
          icon="search"
          title="Taking too long"
          message="We couldn't reach the resort data in time. Check your connection and try again."
          action={{
            label: "Try Again",
            onPress: runRecommendations,
          }}
        />
      </ScreenContainer>
    );
  }

  // Empty state — no matches
  if (results.length === 0) {
    return (
      <ScreenContainer>
        <NavBar />
        <Head>
          <title>Your Top Ski Matches | PisteWise</title>
          <meta
            name="description"
            content="Your personalised ski resort recommendations are ready. Explore your top matches."
          />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <EmptyState
          icon="search"
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

      <NavBar />
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
          onPress={() =>
            router.push({
              pathname: "/(onboarding)/decision-flow",
              params: {
                scores: JSON.stringify(topPick.attributeScores),
                matchScore: String(topPick.matchScore),
                resortName: topPick.resort.name,
              },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Want to know how this was chosen? Tap to see the decision flow visualization"
        >
          <View style={styles.decisionFlowIcon}>
            <Search size={22} color={colors.brand.primary} strokeWidth={1.5} />
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

      {/* Sticky footer — enter the main app */}
      <View style={styles.stickyFooter}>
        <Button
          label="Explore Resorts →"
          onPress={() => router.replace("/(main)")}
          fullWidth
          size="prominent"
          accessibilityLabel="Go to the main app to explore resorts"
        />
      </View>
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
  stickyFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});

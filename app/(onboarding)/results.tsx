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
import { View, ScrollView, StyleSheet, Pressable, Modal } from "react-native";
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
import { Slider } from "@components/ui/Slider";
import { Search, SlidersHorizontal } from "lucide-react-native";
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
  const [tweakVisible, setTweakVisible] = useState(false);
  const { hPadding } = useLayout();
  const content = useContent();

  const {
    crowdPreference,
    snowImportance,
    familyVsNightlife,
    setCrowdPreference,
    setSnowImportance,
    setFamilyVsNightlife,
  } = usePreferencesStore();

  const [draftCrowd, setDraftCrowd] = useState(crowdPreference);
  const [draftSnow, setDraftSnow] = useState(snowImportance);
  const [draftFamily, setDraftFamily] = useState(familyVsNightlife);

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

  /** Apply tweaked preferences and re-run. */
  const handleApplyTweak = () => {
    setCrowdPreference(draftCrowd);
    setSnowImportance(draftSnow);
    setFamilyVsNightlife(draftFamily);
    setTweakVisible(false);
    runRecommendations();
  };

  const handleOpenTweak = () => {
    setDraftCrowd(crowdPreference);
    setDraftSnow(snowImportance);
    setDraftFamily(familyVsNightlife);
    setTweakVisible(true);
  };

  useEffect(() => {
    runRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <View style={styles.headerActions}>
            <Pressable
              style={styles.tweakButton}
              onPress={handleOpenTweak}
              accessibilityRole="button"
              accessibilityLabel="Tweak your preferences"
            >
              <SlidersHorizontal
                size={16}
                color={colors.brand.primary}
                strokeWidth={2}
              />
              <Text style={styles.tweakButtonLabel}>Tweak</Text>
            </Pressable>
            <Button
              label={content.onboarding.results.retake}
              variant="ghost"
              size="compact"
              onPress={() => router.replace("/(onboarding)")}
            />
          </View>
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

      {/* Tweak preferences modal */}
      <Modal
        visible={tweakVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTweakVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setTweakVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close tweak panel"
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text variant="h2" style={styles.modalTitle}>
            Tweak Your Results
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            style={styles.modalSubtitle}
          >
            Adjust and we'll re-rank the resorts instantly.
          </Text>

          <View style={styles.sliderGroup}>
            <View style={styles.sliderLabel}>
              <Text style={styles.sliderLabelText}>Crowd tolerance</Text>
              <Text style={styles.sliderValue}>
                {draftCrowd === 1
                  ? "Quiet"
                  : draftCrowd === 5
                    ? "Lively"
                    : draftCrowd}
              </Text>
            </View>
            <Slider
              value={draftCrowd}
              minimumValue={1}
              maximumValue={5}
              step={1}
              onValueChange={setDraftCrowd}
              accessibilityLabel="Crowd tolerance slider"
            />
            <View style={styles.sliderEndLabels}>
              <Text style={styles.sliderEndLabel}>Quiet slopes</Text>
              <Text style={styles.sliderEndLabel}>Buzzing resort</Text>
            </View>
          </View>

          <View style={styles.sliderGroup}>
            <View style={styles.sliderLabel}>
              <Text style={styles.sliderLabelText}>Snow importance</Text>
              <Text style={styles.sliderValue}>
                {draftSnow === 1
                  ? "Low"
                  : draftSnow === 5
                    ? "Critical"
                    : draftSnow}
              </Text>
            </View>
            <Slider
              value={draftSnow}
              minimumValue={1}
              maximumValue={5}
              step={1}
              onValueChange={setDraftSnow}
              accessibilityLabel="Snow importance slider"
            />
            <View style={styles.sliderEndLabels}>
              <Text style={styles.sliderEndLabel}>Not fussed</Text>
              <Text style={styles.sliderEndLabel}>Snow guaranteed</Text>
            </View>
          </View>

          <View style={styles.sliderGroup}>
            <View style={styles.sliderLabel}>
              <Text style={styles.sliderLabelText}>Atmosphere</Text>
              <Text style={styles.sliderValue}>
                {draftFamily <= 2
                  ? "Family"
                  : draftFamily >= 4
                    ? "Nightlife"
                    : "Balanced"}
              </Text>
            </View>
            <Slider
              value={draftFamily}
              minimumValue={1}
              maximumValue={5}
              step={1}
              onValueChange={setDraftFamily}
              accessibilityLabel="Atmosphere preference slider"
            />
            <View style={styles.sliderEndLabels}>
              <Text style={styles.sliderEndLabel}>Family-friendly</Text>
              <Text style={styles.sliderEndLabel}>Après-ski scene</Text>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              label="Cancel"
              variant="ghost"
              onPress={() => setTweakVisible(false)}
              style={styles.modalCancel}
            />
            <Button
              label="Apply & Re-rank"
              onPress={handleApplyTweak}
              style={styles.modalApply}
            />
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  tweakButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primarySubtle,
    borderWidth: 1,
    borderColor: colors.brand.primary + "40",
  },
  tweakButtonLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand.primary,
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
  // ── Tweak modal ────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border.default,
    marginBottom: spacing.lg,
  },
  modalTitle: {
    marginBottom: spacing.xxs,
  },
  modalSubtitle: {
    marginBottom: spacing.xl,
  },
  sliderGroup: {
    marginBottom: spacing.xl,
  },
  sliderLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sliderLabelText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  sliderValue: {
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: "600",
  },
  sliderEndLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  sliderEndLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalCancel: {
    flex: 1,
  },
  modalApply: {
    flex: 2,
  },
});

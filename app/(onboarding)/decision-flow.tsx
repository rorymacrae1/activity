/**
 * Decision Flow Screen
 * Visual representation of how user preferences led to the recommendation
 */

import React from "react";
import { View, ScrollView, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "@/components/ui";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import { usePreferencesStore } from "@/stores/preferences";
import { useContent } from "@/hooks/useContent";
import { SKILL_LEVELS } from "@/constants/options";
import type { AttributeScores } from "@/types/recommendation";
import type { SkillLevel, BudgetLevel } from "@/types/preferences";

const NODE_SIZE = 64;
const LINE_COLOR = colors.border.default;

/**
 * Flow Node - represents a step in the decision process
 */
interface FlowNodeProps {
  icon: string;
  label: string;
  value?: string;
  score?: number;
  highlighted?: boolean;
  size?: number;
}

function FlowNode({
  icon,
  label,
  value,
  score,
  highlighted,
  size = NODE_SIZE,
}: FlowNodeProps) {
  const scoreColor =
    score !== undefined
      ? score >= 80
        ? colors.match.excellent
        : score >= 60
          ? colors.match.good
          : colors.match.fair
      : colors.brand.primary;

  return (
    <View style={styles.nodeContainer}>
      <View
        style={[
          styles.node,
          { width: size, height: size },
          // eslint-disable-next-line react-native/no-inline-styles
          highlighted && { borderColor: scoreColor, borderWidth: 3 },
        ]}
      >
        <Text style={styles.nodeIcon}>{icon}</Text>
        {score !== undefined && (
          <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
            <Text style={styles.scoreBadgeText}>{score}</Text>
          </View>
        )}
      </View>
      <Text style={styles.nodeLabel}>{label}</Text>
      {value && <Text style={styles.nodeValue}>{value}</Text>}
    </View>
  );
}

/**
 * Connector line between nodes
 */
function ConnectorLine({
  direction = "down",
}: {
  direction?: "down" | "right";
}) {
  if (direction === "right") {
    return <View style={styles.connectorHorizontal} />;
  }
  return <View style={styles.connectorVertical} />;
}

/**
 * Section divider with label
 */
function SectionDivider({ label }: { label: string }) {
  return (
    <View style={styles.sectionDivider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

/**
 * Skill level labels
 * (defined inside component via content — see DecisionFlowScreen)
 */

/**
 * Budget level labels
 * (defined inside component via content — see DecisionFlowScreen)
 */

export default function DecisionFlowScreen() {
  const router = useRouter();
  const content = useContent();
  const { scores, matchScore, resortName } = useLocalSearchParams<{
    scores: string;
    matchScore: string;
    resortName: string;
  }>();

  // Read individual preference values from store
  const groupAbilities = usePreferencesStore((s) => s.groupAbilities);
  const budgetLevel = usePreferencesStore((s) => s.budgetLevel);
  const regions = usePreferencesStore((s) => s.regions);
  const crowdPreference = usePreferencesStore((s) => s.crowdPreference);
  const familyVsNightlife = usePreferencesStore((s) => s.familyVsNightlife);

  // Labels derived from i18n content — not hardcoded English
  const skillLabels: Record<SkillLevel, string> = {
    beginner: content.onboarding.skill.options.beginner.title,
    intermediate: content.onboarding.skill.options.intermediate.title,
    red: content.onboarding.skill.options.red.title,
    advanced: content.onboarding.skill.options.advanced.title,
  };
  const budgetLabels: Record<BudgetLevel, string> = {
    budget: content.onboarding.budget.options.budget.title,
    mid: content.onboarding.budget.options.mid.title,
    premium: content.onboarding.budget.options.premium.title,
    luxury: content.onboarding.budget.options.luxury.title,
  };

  const getSkillDisplay = (abilities: SkillLevel[]): string => {
    if (abilities.length === 0) return "Any";
    const highest = abilities.reduce(
      (max, curr) =>
        SKILL_LEVELS.indexOf(curr) > SKILL_LEVELS.indexOf(max) ? curr : max,
      abilities[0]!,
    );
    return skillLabels[highest] ?? "Any";
  };

  const getBudgetDisplay = (level: BudgetLevel | null): string => {
    if (level === null) return "Any";
    return budgetLabels[level] ?? "Any";
  };

  const attributeScores: AttributeScores = scores
    ? (JSON.parse(scores) as AttributeScores)
    : { skill: 0, budget: 0, vibe: 0, activity: 0, snow: 0 };

  const finalMatchScore = matchScore
    ? Math.round(Number(matchScore))
    : Math.round(
        (attributeScores.skill +
          attributeScores.budget +
          attributeScores.vibe +
          attributeScores.activity +
          attributeScores.snow) /
          5,
      );

  const displayResortName = resortName ?? "Your Top Match";

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>How We Chose</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={Platform.OS !== "web"}
      >
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Your Decision Journey</Text>
          <Text style={styles.introText}>
            Here's how your preferences were matched against resort attributes
            to find your perfect ski destination.
          </Text>
        </View>

        {/* Input Preferences Section */}
        <SectionDivider label="Your Preferences" />

        <View style={styles.flowSection}>
          <View style={styles.nodesRow}>
            <FlowNode
              icon="⛷️"
              label="Skill"
              value={getSkillDisplay(groupAbilities)}
            />
            <FlowNode
              icon="💰"
              label="Budget"
              value={getBudgetDisplay(budgetLevel)}
            />
            <FlowNode
              icon="✨"
              label="Vibes"
              value={`Crowd: ${crowdPreference}`}
            />
          </View>

          <View style={styles.nodesRow}>
            <FlowNode
              icon="🌍"
              label="Regions"
              value={`${regions.length} countries`}
            />
            <FlowNode
              icon="🎉"
              label="Nightlife"
              value={familyVsNightlife > 3 ? "Active" : "Relaxed"}
            />
          </View>
        </View>

        <ConnectorLine direction="down" />

        {/* Scoring Engine Section */}
        <SectionDivider label="Scoring Engine" />

        <View style={styles.engineBox}>
          <Text style={styles.engineIcon}>⚙️</Text>
          <Text style={styles.engineTitle}>Matching Algorithm</Text>
          <Text style={styles.engineText}>
            Each resort is scored across 5 dimensions based on how well it
            matches your preferences.
          </Text>
        </View>

        <ConnectorLine direction="down" />

        {/* Attribute Scores Section */}
        <SectionDivider label="Match Scores" />

        <View style={styles.flowSection}>
          <View style={styles.nodesRow}>
            <FlowNode
              icon="⛷️"
              label="Skill"
              score={attributeScores.skill}
              highlighted
            />
            <FlowNode
              icon="💰"
              label="Budget"
              score={attributeScores.budget}
              highlighted
            />
            <FlowNode
              icon="✨"
              label="Vibe"
              score={attributeScores.vibe}
              highlighted
            />
          </View>

          <View style={styles.nodesRow}>
            <FlowNode
              icon="🎿"
              label="Activity"
              score={attributeScores.activity}
              highlighted
            />
            <FlowNode
              icon="❄️"
              label="Snow"
              score={attributeScores.snow}
              highlighted
            />
          </View>
        </View>

        <ConnectorLine direction="down" />

        {/* Final Result Section */}
        <SectionDivider label="Result" />

        <View style={styles.resultBox}>
          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeText}>🏆</Text>
          </View>
          <Text style={styles.resultTitle}>{displayResortName}</Text>
          <Text style={styles.resultScore}>
            Overall Match:{" "}
            <Text style={styles.resultScoreValue}>{finalMatchScore}%</Text>
          </Text>
        </View>

        {/* Back to Results */}
        <View style={styles.footer}>
          <Button
            label="Back to Results"
            onPress={handleBack}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas.default,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 24,
    color: colors.ink.rich,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.ink.rich,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  introSection: {
    padding: spacing.lg,
    alignItems: "center",
  },
  introTitle: {
    ...typography.h2,
    color: colors.ink.rich,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  introText: {
    ...typography.body,
    color: colors.ink.normal,
    textAlign: "center",
    maxWidth: 300,
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  dividerLabel: {
    ...typography.label,
    color: colors.ink.muted,
    paddingHorizontal: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  flowSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  nodesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    flexWrap: "wrap",
  },
  nodeContainer: {
    alignItems: "center",
    width: 80,
  },
  node: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border.default,
    shadowColor: colors.ink.rich,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  nodeIcon: {
    fontSize: 24,
  },
  scoreBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface.primary,
  },
  scoreBadgeText: {
    ...typography.labelSmall,
    fontSize: 10,
    fontWeight: "700",
    color: colors.ink.onBrand,
  },
  nodeLabel: {
    ...typography.labelSmall,
    color: colors.ink.rich,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  nodeValue: {
    ...typography.bodySmall,
    color: colors.ink.muted,
    textAlign: "center",
  },
  connectorVertical: {
    width: 2,
    height: 40,
    backgroundColor: LINE_COLOR,
    alignSelf: "center",
    marginVertical: spacing.sm,
  },
  connectorHorizontal: {
    width: 40,
    height: 2,
    backgroundColor: LINE_COLOR,
  },
  engineBox: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  engineIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  engineTitle: {
    ...typography.bodyMedium,
    fontWeight: "600",
    color: colors.ink.rich,
    marginBottom: spacing.xs,
  },
  engineText: {
    ...typography.bodySmall,
    color: colors.ink.normal,
    textAlign: "center",
  },
  resultBox: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.brand.primary,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  resultBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.onDark.surface.light,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  resultBadgeText: {
    fontSize: 28,
  },
  resultTitle: {
    ...typography.h3,
    color: colors.ink.onBrand,
    marginBottom: spacing.xs,
  },
  resultScore: {
    ...typography.body,
    color: colors.onDark.text.secondary,
  },
  resultScoreValue: {
    fontWeight: "700",
    color: colors.ink.onBrand,
  },
  footer: {
    padding: spacing.lg,
    marginTop: spacing.md,
  },
});

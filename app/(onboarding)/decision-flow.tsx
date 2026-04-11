/**
 * Decision Flow Screen
 * Visual representation of how user preferences led to the recommendation
 */

import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "@/components/ui";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import { usePreferencesStore } from "@/stores/preferences";
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
 */
const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  red: "Red Runs",
  advanced: "Advanced",
};

/**
 * Get skill level display text
 */
function getSkillDisplay(abilities: SkillLevel[]): string {
  if (abilities.length === 0) return "Any";
  // Show highest ability level
  const order: SkillLevel[] = [
    "beginner",
    "intermediate",
    "red",
    "advanced",
  ];
  const highest = abilities.reduce(
    (max, curr) => (order.indexOf(curr) > order.indexOf(max) ? curr : max),
    abilities[0],
  );
  return SKILL_LABELS[highest] || "Any";
}

/**
 * Budget level labels
 */
const BUDGET_LABELS: Record<BudgetLevel, string> = {
  budget: "Budget",
  mid: "Mid-range",
  premium: "Premium",
  luxury: "Luxury",
};

/**
 * Get budget display text
 */
function getBudgetDisplay(level: BudgetLevel | null): string {
  if (level === null) return "Any";
  return BUDGET_LABELS[level] || "Any";
}

export default function DecisionFlowScreen() {
  const router = useRouter();

  // Read individual preference values from store
  const groupAbilities = usePreferencesStore((s) => s.groupAbilities);
  const budgetLevel = usePreferencesStore((s) => s.budgetLevel);
  const regions = usePreferencesStore((s) => s.regions);
  const crowdPreference = usePreferencesStore((s) => s.crowdPreference);
  const familyVsNightlife = usePreferencesStore((s) => s.familyVsNightlife);

  // Mock attribute scores for visualization (in real app, pass via params)
  const mockScores: AttributeScores = {
    skill: 92,
    budget: 85,
    vibe: 78,
    activity: 88,
    snow: 95,
  };

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
        showsVerticalScrollIndicator={false}
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
              score={mockScores.skill}
              highlighted
            />
            <FlowNode
              icon="💰"
              label="Budget"
              score={mockScores.budget}
              highlighted
            />
            <FlowNode
              icon="✨"
              label="Vibe"
              score={mockScores.vibe}
              highlighted
            />
          </View>

          <View style={styles.nodesRow}>
            <FlowNode
              icon="🎿"
              label="Activity"
              score={mockScores.activity}
              highlighted
            />
            <FlowNode
              icon="❄️"
              label="Snow"
              score={mockScores.snow}
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
          <Text style={styles.resultTitle}>Your Perfect Match</Text>
          <Text style={styles.resultScore}>
            Overall Score:{" "}
            <Text style={styles.resultScoreValue}>
              {Math.round(
                (mockScores.skill +
                  mockScores.budget +
                  mockScores.vibe +
                  mockScores.activity +
                  mockScores.snow) /
                  5,
              )}
              %
            </Text>
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
    backgroundColor: colors.background.primary,
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
    color: colors.text.primary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
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
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  introText: {
    ...typography.body,
    color: colors.text.secondary,
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
    color: colors.text.tertiary,
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
    color: colors.text.primary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  nodeValue: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
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
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  engineText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
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
    backgroundColor: "rgba(255,255,255,0.2)",
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
    color: "rgba(255,255,255,0.9)",
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

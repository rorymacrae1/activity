/**
 * ReasonCard - Individual match reason card for the carousel
 * Displays an attribute score with icon, label, and animated progress bar
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";

/**
 * Attribute configuration with icon, label, and description
 */
const ATTRIBUTE_CONFIG: Record<
  string,
  {
    icon: IconName;
    label: string;
    description: string;
    goodMessage: string;
    excellentMessage: string;
  }
> = {
  skill: {
    icon: "mountain",
    label: "Skill Match",
    description: "Terrain difficulty alignment",
    goodMessage: "Good terrain variety for your level",
    excellentMessage: "Perfect terrain for your ability",
  },
  budget: {
    icon: "wallet",
    label: "Budget Fit",
    description: "Price range compatibility",
    goodMessage: "Reasonable value for money",
    excellentMessage: "Excellent value within your budget",
  },
  vibe: {
    icon: "sparkles",
    label: "Vibe Match",
    description: "Atmosphere alignment",
    goodMessage: "Matches your preferred atmosphere",
    excellentMessage: "Perfect atmosphere for your style",
  },
  activity: {
    icon: "activity",
    label: "Activities",
    description: "Available experiences",
    goodMessage: "Good activity options available",
    excellentMessage: "Excellent range of activities",
  },
  snow: {
    icon: "snowflake",
    label: "Snow Quality",
    description: "Reliability and conditions",
    goodMessage: "Reliable snow conditions",
    excellentMessage: "Outstanding snow reliability",
  },
};

interface ReasonCardProps {
  /** Attribute key (skill, budget, vibe, activity, snow) */
  attribute: string;
  /** Score from 0 to 100 */
  score: number;
  /** Optional width for the card */
  width?: number;
}

/**
 * Get color based on score value
 */
function getScoreColor(score: number): string {
  if (score >= 80) return colors.match.excellent;
  if (score >= 60) return colors.match.good;
  if (score >= 40) return colors.match.fair;
  return colors.match.poor;
}

/**
 * Get descriptive message based on score
 */
function getScoreMessage(attribute: string, score: number): string {
  const config = ATTRIBUTE_CONFIG[attribute];
  if (!config) return "";

  if (score >= 80) return config.excellentMessage;
  return config.goodMessage;
}

/**
 * ReasonCard component
 */
export function ReasonCard({ attribute, score, width = 260 }: ReasonCardProps) {
  const config = ATTRIBUTE_CONFIG[attribute];

  if (!config) {
    return null;
  }

  const scoreColor = getScoreColor(score);
  const message = getScoreMessage(attribute, score);

  return (
    <View
      style={[styles.container, { width }]}
      accessibilityRole="text"
      accessibilityLabel={`${config.label}: ${score}% match. ${message}`}
    >
      {/* Icon and Label */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon
            name={config.icon}
            size={20}
            color={colors.brand.primary}
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{config.label}</Text>
          <Text style={styles.description}>{config.description}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{score}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(score, 100)}%`,
                backgroundColor: scoreColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    shadowColor: colors.ink.rich,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    ...typography.bodyMedium,
    fontWeight: "600",
    color: colors.ink.rich,
  },
  description: {
    ...typography.bodySmall,
    color: colors.ink.muted,
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  scoreText: {
    ...typography.labelSmall,
    fontWeight: "700",
    color: colors.ink.onBrand,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.surface.tertiary,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  message: {
    ...typography.bodySmall,
    color: colors.ink.normal,
    lineHeight: 18,
  },
});

export default ReasonCard;

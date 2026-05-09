/**
 * ReasonCard - Individual match reason card for the carousel
 * Displays an attribute score with icon, label, and progress bar
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import type { ViewStyle, StyleProp } from "react-native";
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
  /** Optional additional styles */
  style?: StyleProp<ViewStyle>;
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
 * Get score label text
 */
function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
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
export function ReasonCard({
  attribute,
  score,
  width = 260,
  style,
}: ReasonCardProps) {
  const config = ATTRIBUTE_CONFIG[attribute];

  if (!config) {
    return null;
  }

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const message = getScoreMessage(attribute, score);

  return (
    <View
      style={[styles.container, { width }, style]}
      accessibilityRole="text"
      accessibilityLabel={`${config.label}: ${score}% match. ${message}`}
    >
      {/* Score ring + icon */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {score}
          </Text>
        </View>
        <View
          style={[styles.iconBadge, { backgroundColor: `${scoreColor}18` }]}
        >
          <Icon
            name={config.icon}
            size={16}
            color={scoreColor}
            strokeWidth={2}
          />
        </View>
      </View>

      {/* Label + score label */}
      <Text style={styles.label}>{config.label}</Text>
      <Text style={[styles.scoreLabel, { color: scoreColor }]}>
        {scoreLabel}
      </Text>

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
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: "center",
  },
  scoreSection: {
    position: "relative",
    marginBottom: spacing.md,
  },
  scoreRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.primary,
  },
  scoreValue: {
    ...typography.h2,
    fontWeight: "700",
  },
  iconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface.primary,
  },
  label: {
    ...typography.bodyMedium,
    fontWeight: "600",
    color: colors.ink.rich,
    textAlign: "center",
  },
  scoreLabel: {
    ...typography.labelSmall,
    fontWeight: "600",
    marginTop: spacing.xxs,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  progressBackground: {
    height: 6,
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
    textAlign: "center",
  },
});

export default ReasonCard;

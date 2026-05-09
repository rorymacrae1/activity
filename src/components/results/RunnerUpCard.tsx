/**
 * RunnerUpCard - Resort card for runner-up recommendations
 * Displays resort image, match score, details, and top match reason
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import type { ViewStyle, StyleProp } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import { ResortImage } from "@/components/ui/ResortImage";
import { useContent } from "@/hooks/useContent";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import type {
  RecommendationResult,
  AttributeScores,
} from "@/types/recommendation";

interface RunnerUpCardProps {
  /** Recommendation result with resort and scores */
  result: RecommendationResult;
  /** Ranking position (2, 3, 4...) */
  rank: number;
  /** Optional card width */
  width?: number;
  /** IDs of sibling runner-up resorts for compare section */
  siblingIds?: string[];
  /** Optional additional styles */
  style?: StyleProp<ViewStyle>;
}

const ATTRIBUTE_META: Record<string, { icon: IconName; label: string }> = {
  skill: { icon: "mountain", label: "Great terrain match" },
  budget: { icon: "wallet", label: "Fits your budget" },
  vibe: { icon: "sparkles", label: "Perfect vibe" },
  activity: { icon: "activity", label: "Excellent activities" },
  snow: { icon: "snowflake", label: "Reliable snow" },
};

/**
 * Get the highest-scoring attribute to use as a tagline
 */
function getTopAttribute(scores: AttributeScores): {
  key: string;
  score: number;
} {
  const entries = Object.entries(scores) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return { key: entries[0][0], score: entries[0][1] };
}

/**
 * Convert average daily cost to price level (1-4)
 */
function getPriceLevel(dailyCost: number): number {
  if (dailyCost < 120) return 1;
  if (dailyCost < 180) return 2;
  if (dailyCost < 250) return 3;
  return 4;
}

/**
 * Format price level to currency symbols
 */
function formatPriceLevel(level: number, symbol: string): string {
  return symbol.repeat(Math.max(1, Math.min(level, 4)));
}

/**
 * Get color based on match score
 */
function getScoreColor(score: number): string {
  if (score >= 80) return colors.match.excellent;
  if (score >= 60) return colors.match.good;
  return colors.match.fair;
}

/**
 * RunnerUpCard component
 */
export function RunnerUpCard({
  result,
  rank,
  width = 200,
  siblingIds,
  style,
}: RunnerUpCardProps) {
  const router = useRouter();
  const content = useContent();
  const { resort, matchScore, attributeScores } = result;

  const scoreColor = getScoreColor(matchScore);
  const priceLevel = getPriceLevel(resort.attributes.averageDailyCost);
  const topAttr = getTopAttribute(attributeScores);
  const topMeta = ATTRIBUTE_META[topAttr.key];

  const handlePress = () => {
    router.push({
      pathname: "/(main)/resort/[id]",
      params: {
        id: resort.id,
        ...(siblingIds && { siblingIds: siblingIds.join(",") }),
      },
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { width },
        pressed && styles.containerPressed,
        style,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${resort.name}, ${resort.country}. ${matchScore}% match. Tap to view details.`}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <ResortImage
          uri={resort.assets.heroImage}
          style={styles.image}
          accessibilityLabel={`${resort.name} ski resort`}
        />

        {/* Score Badge */}
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{matchScore}%</Text>
        </View>

        {/* Rank indicator */}
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {resort.name}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {resort.region}, {resort.country}
        </Text>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon
              name="mountain"
              size={12}
              color={colors.ink.normal}
              strokeWidth={2}
            />
            <Text style={styles.stat}>{resort.stats.totalKm}km</Text>
          </View>
          <View style={styles.statItem}>
            <Icon
              name="wallet"
              size={12}
              color={colors.ink.normal}
              strokeWidth={2}
            />
            <Text style={styles.stat}>
              {formatPriceLevel(priceLevel, content.currencySymbol)}
            </Text>
          </View>
        </View>

        {/* Top match reason tagline */}
        {topMeta && (
          <View style={styles.tagline}>
            <Icon
              name={topMeta.icon}
              size={12}
              color={scoreColor}
              strokeWidth={2}
            />
            <Text
              style={[styles.taglineText, { color: scoreColor }]}
              numberOfLines={1}
            >
              {topMeta.label}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  containerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    height: 140,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  rankBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  rankText: {
    ...typography.labelSmall,
    fontWeight: "700",
    color: colors.onDark.text.primary,
  },
  scoreBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  scoreText: {
    ...typography.labelSmall,
    fontWeight: "700",
    color: colors.ink.onBrand,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    ...typography.bodyMedium,
    fontWeight: "600",
    color: colors.ink.rich,
  },
  location: {
    ...typography.bodySmall,
    color: colors.ink.normal,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stat: {
    ...typography.bodySmall,
    color: colors.ink.muted,
  },
  tagline: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  taglineText: {
    ...typography.labelSmall,
    fontWeight: "600",
  },
});

export default RunnerUpCard;

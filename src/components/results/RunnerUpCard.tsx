/**
 * RunnerUpCard - Compact resort card for runner-up recommendations
 * Displays resort with match score and key details in a horizontal layout
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { ResortImage } from "@/components/ui/ResortImage";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import type { RecommendationResult } from "@/types/recommendation";

interface RunnerUpCardProps {
  /** Recommendation result with resort and scores */
  result: RecommendationResult;
  /** Ranking position (2, 3, 4...) */
  rank: number;
  /** Optional card width */
  width?: number;
  /** IDs of sibling runner-up resorts for compare section */
  siblingIds?: string[];
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
 * Format price level to euro symbols
 */
function formatPriceLevel(level: number): string {
  return "€".repeat(Math.max(1, Math.min(level, 4)));
}

/**
 * Get rank badge color for top positions
 */
function getRankColor(rank: number): string | null {
  if (rank === 2) return colors.rank.silver;
  if (rank === 3) return colors.rank.bronze;
  return null;
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
}: RunnerUpCardProps) {
  const router = useRouter();
  const { resort, matchScore } = result;

  const rankColor = getRankColor(rank);
  const scoreColor = getScoreColor(matchScore);
  const priceLevel = getPriceLevel(resort.attributes.averageDailyCost);

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

        {/* Rank Badge */}
        {rankColor && (
          <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
            <Icon
              name="star"
              size={14}
              color={colors.ink.inverse}
              strokeWidth={2}
            />
          </View>
        )}

        {/* Score Badge */}
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{matchScore}%</Text>
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
            <Text style={styles.stat}>{formatPriceLevel(priceLevel)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginRight: spacing.sm,
    shadowColor: colors.ink.rich,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  containerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    height: 120,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  rankBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.ink.rich,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  scoreBadge: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
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
    padding: spacing.sm,
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
    gap: spacing.sm,
    marginTop: spacing.xs,
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
});

export default RunnerUpCard;

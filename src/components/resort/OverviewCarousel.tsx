/**
 * OverviewCarousel - Horizontal swipeable overview cards for resort details
 * Consolidates key stats into digestible, swipeable cards
 */

import React, { useRef, useState } from "react";
import type {
  NativeSyntheticEvent,
  NativeScrollEvent} from "react-native";
import {
  View,
  ScrollView,
  StyleSheet
} from "react-native";
import { Text } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import type { Resort } from "@/types/resort";

const CARD_WIDTH = 200;
const CARD_MARGIN = spacing.sm;

interface OverviewCarouselProps {
  /** Resort data */
  resort: Resort;
}

interface OverviewCardProps {
  icon: IconName;
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}

/**
 * Individual overview card
 */
function OverviewCard({
  icon,
  title,
  value,
  subtitle,
  color = colors.brand.primary,
}: OverviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Icon name={icon} size={22} color={color} strokeWidth={1.5} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );
}

/**
 * Get terrain level description
 */
function getTerrainLevel(terrain: Resort["terrain"]): string {
  if (terrain.advanced >= 40) return "Expert-friendly";
  if (terrain.intermediate >= 50) return "All-rounder";
  if (terrain.beginner >= 40) return "Beginner-friendly";
  return "Mixed terrain";
}

/**
 * Get price level description
 */
function getPriceLevel(dailyCost: number): { label: string; pounds: string } {
  if (dailyCost < 120) return { label: "Budget", pounds: "£" };
  if (dailyCost < 180) return { label: "Mid-range", pounds: "££" };
  if (dailyCost < 250) return { label: "Premium", pounds: "£££" };
  return { label: "Luxury", pounds: "££££" };
}

/**
 * Get vibe description
 */
function getVibeDescription(resort: Resort): string {
  if (resort.attributes.nightlifeScore >= 4) return "Lively après-ski";
  if (resort.attributes.familyScore >= 4) return "Family-focused";
  if (resort.attributes.crowdLevel <= 2) return "Peaceful & quiet";
  return "Relaxed atmosphere";
}

/**
 * Format an ISO date string to a short month label e.g. "Nov"
 */
function shortMonth(iso: string): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = parseInt(iso.split("-")[1], 10) - 1;
  return months[month] ?? iso.slice(5, 7);
}

/**
 * OverviewCarousel component
 */
export function OverviewCarousel({ resort }: OverviewCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const priceInfo = getPriceLevel(resort.attributes.averageDailyCost);
  const terrainLevel = getTerrainLevel(resort.terrain);
  const vibeDesc = getVibeDescription(resort);
  const seasonLabel = `${shortMonth(resort.season.start)} – ${shortMonth(resort.season.end)}`;
  const transferHours = Math.floor(resort.attributes.transferTimeMinutes / 60);
  const transferMins = resort.attributes.transferTimeMinutes % 60;
  const transferLabel =
    transferHours > 0
      ? transferMins > 0
        ? `${transferHours}h ${transferMins}m`
        : `${transferHours}h`
      : `${transferMins}m`;

  const cards: OverviewCardProps[] = [
    {
      icon: "mountain",
      title: "Terrain",
      value: `${resort.stats.totalKm}km`,
      subtitle: terrainLevel,
      color: colors.brand.primary,
    },
    {
      icon: "snowflake",
      title: "Snow Reliability",
      value: `${resort.attributes.snowReliability}/5`,
      subtitle:
        resort.attributes.snowReliability >= 4 ? "Very reliable" : "Seasonal",
      color: colors.sentiment.info,
    },
    {
      icon: "wallet",
      title: "Budget",
      value: priceInfo.pounds,
      subtitle: `~£${resort.attributes.averageDailyCost}/day`,
      color: colors.match.good,
    },
    {
      icon: "trending-up",
      title: "Altitude",
      value: `${resort.location.peakAltitude}m`,
      subtitle: `Village: ${resort.location.villageAltitude}m`,
      color: colors.brand.primaryStrong,
    },
    {
      icon: "sparkles",
      title: "Vibe",
      value: resort.attributes.townStyle,
      subtitle: vibeDesc,
      color: colors.brand.accent,
    },
    {
      icon: "calendar",
      title: "Season",
      value: seasonLabel,
      subtitle:
        resort.stats.lifts > 0
          ? `${resort.stats.lifts} lifts`
          : `${resort.stats.totalKm > 0 ? resort.stats.totalKm + "km" : "Seasonal resort"}`,
      color: colors.sentiment.info,
    },
    {
      icon: "plane",
      title: "Transfer",
      value: resort.attributes.nearestAirport
        ? `${resort.attributes.nearestAirport} airport`
        : "See transport",
      subtitle: `~${transferLabel} from airport`,
      color: colors.brand.primaryStrong,
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN));
    setActiveIndex(Math.max(0, Math.min(index, cards.length - 1)));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        accessibilityRole="adjustable"
        accessibilityLabel="Resort overview carousel"
      >
        {cards.map((card, index) => (
          <OverviewCard key={index} {...card} />
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {cards.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: CARD_MARGIN,
    shadowColor: colors.ink.rich,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.labelSmall,
    color: colors.ink.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xxs,
  },
  cardValue: {
    ...typography.h3,
    color: colors.ink.rich,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.ink.normal,
    marginTop: spacing.xxs,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    backgroundColor: colors.brand.primary,
    width: 20,
  },
});

export default OverviewCarousel;

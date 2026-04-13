/**
 * SimilarResortsCarousel - Horizontal carousel of similar resort recommendations
 * For use on resort detail pages to show comparable alternatives
 */

import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { ResortImage } from "@/components/ui/ResortImage";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import type { Resort } from "@/types/resort";

const CARD_WIDTH = 180;
const CARD_MARGIN = spacing.sm;

// ─────────────────────────────────────────────────────────────────────────────
// SimilarResortCard
// ─────────────────────────────────────────────────────────────────────────────

interface SimilarResortCardProps {
  resort: Resort;
  width?: number;
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

function SimilarResortCard({
  resort,
  width = CARD_WIDTH,
}: SimilarResortCardProps) {
  const router = useRouter();
  const priceLevel = getPriceLevel(resort.attributes.averageDailyCost);

  const handlePress = () => {
    router.push(`/(main)/resort/${resort.id}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && styles.cardPressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${resort.name}, ${resort.country}. Tap to view details.`}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <ResortImage
          uri={resort.assets.heroImage}
          style={styles.image}
          accessibilityLabel={`${resort.name} ski resort`}
        />
        {/* Country badge */}
        <View style={styles.countryBadge}>
          <Text style={styles.countryText}>{resort.country}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {resort.name}
        </Text>
        <Text style={styles.region} numberOfLines={1}>
          {resort.region}
        </Text>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon
              name="mountain"
              size={12}
              color={colors.text.secondary}
              strokeWidth={2}
            />
            <Text style={styles.stat}>{resort.stats.totalKm}km</Text>
          </View>
          <View style={styles.statItem}>
            <Icon
              name="wallet"
              size={12}
              color={colors.text.secondary}
              strokeWidth={2}
            />
            <Text style={styles.stat}>{formatPriceLevel(priceLevel)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SimilarResortsCarousel
// ─────────────────────────────────────────────────────────────────────────────

interface SimilarResortsCarouselProps {
  /** Array of similar resorts */
  resorts: Resort[];
  /** Section heading */
  heading?: string;
  /** Subheading/context */
  subheading?: string;
}

export function SimilarResortsCarousel({
  resorts,
  heading = "Compare Against Close Seconds",
  subheading,
}: SimilarResortsCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Don't render if no resorts
  if (resorts.length === 0) {
    return null;
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN));
    setActiveIndex(Math.max(0, Math.min(index, resorts.length - 1)));
  };

  return (
    <View style={styles.container}>
      {/* Section Heading */}
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>{heading}</Text>
        {subheading && <Text style={styles.subheading}>{subheading}</Text>}
      </View>

      {/* Carousel */}
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
        accessibilityLabel="Similar resorts carousel"
        accessibilityHint="Swipe left or right to see more similar resorts"
      >
        {resorts.map((resort) => (
          <SimilarResortCard key={resort.id} resort={resort} />
        ))}
      </ScrollView>

      {/* Pagination indicator */}
      {resorts.length > 2 && (
        <View style={styles.pagination}>
          {resorts.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  headingContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  heading: {
    ...typography.h3,
    color: colors.text.primary,
  },
  subheading: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  // Card styles
  card: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginRight: CARD_MARGIN,
    shadowColor: colors.ink.rich,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    height: 100,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  countryBadge: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  countryText: {
    ...typography.labelSmall,
    color: colors.ink.onBrand,
    fontWeight: "600",
  },
  content: {
    padding: spacing.sm,
  },
  name: {
    ...typography.bodyMedium,
    fontWeight: "600",
    color: colors.text.primary,
  },
  region: {
    ...typography.bodySmall,
    color: colors.text.secondary,
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
    color: colors.text.tertiary,
  },
  // Pagination
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    backgroundColor: colors.brand.primary,
    width: 16,
  },
});

export default SimilarResortsCarousel;

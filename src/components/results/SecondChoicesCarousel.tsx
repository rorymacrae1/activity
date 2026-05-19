/**
 * SecondChoicesCarousel - Horizontal carousel of runner-up resort recommendations
 * Responsive card sizing with peek effect and animated pagination
 */

import React, { useRef } from "react";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { View, ScrollView, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Text } from "@/components/ui";
import { RunnerUpCard } from "./RunnerUpCard";
import { useLayout } from "@/hooks/useLayout";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import type { RecommendationResult } from "@/types/recommendation";

/** Right-side peek so users see there's more to scroll */
const PEEK_WIDTH = 32;
const CARD_GAP = spacing.md;

interface SecondChoicesCarouselProps {
  /** Array of recommendation results (excluding top pick) */
  results: RecommendationResult[];
  /** Optional section heading */
  heading?: string;
  /** Maximum number of results to show */
  maxResults?: number;
}

/**
 * Compute card width from screen width
 */
function getCardWidth(screenWidth: number, isTablet: boolean): number {
  const hPad = spacing.lg * 2;
  if (isTablet) {
    // Show 2.5 cards on tablet
    return Math.round((screenWidth - hPad - CARD_GAP * 2 - PEEK_WIDTH) / 2);
  }
  // Show 1.15 cards on phone (generous peek)
  return Math.round(screenWidth - hPad - PEEK_WIDTH - CARD_GAP);
}

/**
 * Animated pagination dot
 */
function PaginationDot({ active }: { active: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(active ? 24 : 8, { duration: 250 }),
    backgroundColor: withTiming(
      active ? colors.brand.primary : colors.border.default,
      { duration: 250 },
    ),
    opacity: withTiming(active ? 1 : 0.5, { duration: 250 }),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

/**
 * SecondChoicesCarousel component
 */
export function SecondChoicesCarousel({
  results,
  heading,
  maxResults = 10,
}: SecondChoicesCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const activeIndex = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { screenWidth, isTablet } = useLayout();

  const cardWidth = getCardWidth(screenWidth, isTablet);
  const snapInterval = cardWidth + CARD_GAP;

  // Limit to maxResults
  const displayResults = results.slice(0, maxResults);

  // Compute sibling IDs for the compare section (all runner-up IDs)
  const siblingIds = displayResults.map((r) => r.resort.id);

  // Don't render if no results
  if (displayResults.length === 0) {
    return null;
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / snapInterval);
    const clamped = Math.max(0, Math.min(index, displayResults.length - 1));
    if (clamped !== activeIndex.value) {
      activeIndex.value = clamped;
      setCurrentIndex(clamped);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Heading */}
      {heading && (
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>{heading}</Text>
          <Text style={styles.subheading}>
            {displayResults.length} more great option
            {displayResults.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        accessibilityRole="adjustable"
        accessibilityLabel="Runner-up resorts carousel"
        accessibilityHint="Swipe left or right to see more resort options"
      >
        {displayResults.map((result, index) => (
          <RunnerUpCard
            key={result.resort.id}
            result={result}
            rank={index + 2}
            width={cardWidth}
            siblingIds={siblingIds}
            style={
              index < displayResults.length - 1
                ? { marginRight: CARD_GAP }
                : undefined
            }
          />
        ))}
      </ScrollView>

      {/* Animated Pagination Dots */}
      {displayResults.length > 1 && (
        <View style={styles.pagination}>
          {displayResults.map((_, index) => (
            <PaginationDot key={index} active={index === currentIndex} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  headingContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  heading: {
    ...typography.h3,
    color: colors.ink.rich,
  },
  subheading: {
    ...typography.bodySmall,
    color: colors.ink.normal,
    marginTop: spacing.xxs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
});

export default SecondChoicesCarousel;

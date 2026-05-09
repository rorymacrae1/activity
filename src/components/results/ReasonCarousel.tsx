/**
 * ReasonCarousel - Horizontal swipeable carousel of match reasons
 * Displays attribute scores with snap-to-item scrolling and peek effect
 */

import React, { useRef, useCallback } from "react";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { View, ScrollView, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Text } from "@/components/ui";
import { ReasonCard } from "./ReasonCard";
import { useLayout } from "@/hooks/useLayout";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { radius } from "@/theme/radius";
import type { AttributeScores } from "@/types/recommendation";

/** Right-side peek so users see there's more to scroll */
const PEEK_WIDTH = 32;
const CARD_GAP = spacing.md;

interface ReasonCarouselProps {
  /** Attribute scores object */
  attributeScores: AttributeScores;
  /** Optional section heading */
  heading?: string;
}

/**
 * Compute card width from screen width to fill with peek
 */
function getCardWidth(screenWidth: number, isTablet: boolean): number {
  const hPad = spacing.lg * 2;
  if (isTablet) {
    // Show 2.3 cards on tablet
    return Math.round((screenWidth - hPad - CARD_GAP * 2 - PEEK_WIDTH) / 2);
  }
  // Show 1 card + peek on phone
  return screenWidth - hPad - PEEK_WIDTH;
}

/**
 * Order attributes by score (highest first) to highlight best matches
 */
function getOrderedAttributes(
  scores: AttributeScores,
): Array<{ key: string; score: number }> {
  const attributes = [
    { key: "skill", score: scores.skill },
    { key: "budget", score: scores.budget },
    { key: "vibe", score: scores.vibe },
    { key: "activity", score: scores.activity },
    { key: "snow", score: scores.snow },
  ];

  return attributes.sort((a, b) => b.score - a.score);
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
 * ReasonCarousel component
 */
export function ReasonCarousel({
  attributeScores,
  heading,
}: ReasonCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const activeIndex = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { screenWidth, isTablet } = useLayout();

  const cardWidth = getCardWidth(screenWidth, isTablet);
  const snapInterval = cardWidth + CARD_GAP;
  const orderedAttributes = getOrderedAttributes(attributeScores);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / snapInterval);
      const clamped = Math.max(
        0,
        Math.min(index, orderedAttributes.length - 1),
      );
      if (clamped !== activeIndex.value) {
        activeIndex.value = clamped;
        setCurrentIndex(clamped);
      }
    },
    [snapInterval, orderedAttributes.length, activeIndex],
  );

  return (
    <View style={styles.container}>
      {/* Section Heading */}
      {heading && (
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>{heading}</Text>
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
        accessibilityLabel="Match reasons carousel"
        accessibilityHint="Swipe left or right to see different match reasons"
      >
        {orderedAttributes.map(({ key, score }, index) => (
          <ReasonCard
            key={key}
            attribute={key}
            score={score}
            width={cardWidth}
            style={
              index < orderedAttributes.length - 1
                ? { marginRight: CARD_GAP }
                : undefined
            }
          />
        ))}
      </ScrollView>

      {/* Animated Pagination Dots */}
      <View style={styles.pagination}>
        {orderedAttributes.map((_, index) => (
          <PaginationDot key={index} active={index === currentIndex} />
        ))}
      </View>
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

export default ReasonCarousel;

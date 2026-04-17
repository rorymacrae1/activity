/**
 * ReasonCarousel - Horizontal swipeable carousel of match reasons
 * Displays attribute scores with snap-to-item scrolling
 */

import React, { useRef } from "react";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Text } from "@/components/ui";
import { ReasonCard } from "./ReasonCard";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import type { AttributeScores } from "@/types/recommendation";

const { width: _SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 260;
const CARD_MARGIN = spacing.sm;

interface ReasonCarouselProps {
  /** Attribute scores object */
  attributeScores: AttributeScores;
  /** Optional section heading */
  heading?: string;
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

  // Sort by score descending
  return attributes.sort((a, b) => b.score - a.score);
}

/**
 * ReasonCarousel component
 */
export function ReasonCarousel({
  attributeScores,
  heading,
}: ReasonCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const orderedAttributes = getOrderedAttributes(attributeScores);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN));
    setActiveIndex(Math.max(0, Math.min(index, orderedAttributes.length - 1)));
  };

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
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        accessibilityRole="adjustable"
        accessibilityLabel="Match reasons carousel"
        accessibilityHint="Swipe left or right to see different match reasons"
      >
        {orderedAttributes.map(({ key, score }) => (
          <ReasonCard
            key={key}
            attribute={key}
            score={score}
            width={CARD_WIDTH}
          />
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {orderedAttributes.map((_, index) => (
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
  headingContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  heading: {
    ...typography.h3,
    color: colors.text.primary,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    backgroundColor: colors.brand.primary,
    width: 24,
  },
});

export default ReasonCarousel;

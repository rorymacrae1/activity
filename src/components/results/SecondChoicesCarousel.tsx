/**
 * SecondChoicesCarousel - Horizontal carousel of runner-up resort recommendations
 * Displays next N resort matches after the top pick
 */

import React, { useRef } from "react";
import type {
  NativeSyntheticEvent,
  NativeScrollEvent} from "react-native";
import {
  View,
  ScrollView,
  StyleSheet
} from "react-native";
import { Text } from "@/components/ui";
import { RunnerUpCard } from "./RunnerUpCard";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import type { RecommendationResult } from "@/types/recommendation";

const CARD_WIDTH = 200;
const CARD_MARGIN = spacing.sm;

interface SecondChoicesCarouselProps {
  /** Array of recommendation results (excluding top pick) */
  results: RecommendationResult[];
  /** Optional section heading */
  heading?: string;
  /** Maximum number of results to show */
  maxResults?: number;
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
  const [activeIndex, setActiveIndex] = React.useState(0);

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
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN));
    setActiveIndex(Math.max(0, Math.min(index, displayResults.length - 1)));
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
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
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
            rank={index + 2} // +2 because first place is the top pick
            width={CARD_WIDTH}
            siblingIds={siblingIds}
          />
        ))}
      </ScrollView>

      {/* Pagination indicator - only show if more than 3 cards */}
      {displayResults.length > 3 && (
        <View style={styles.pagination}>
          <View style={styles.paginationTrack}>
            <View
              style={[
                styles.paginationThumb,
                {
                  width: `${(100 / displayResults.length) * Math.min(3, displayResults.length)}%`,
                  transform: [
                    {
                      translateX: (activeIndex / displayResults.length) * 100,
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={styles.paginationText}>
            {activeIndex + 1} of {displayResults.length}
          </Text>
        </View>
      )}
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
  subheading: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  paginationTrack: {
    flex: 1,
    maxWidth: 120,
    height: 4,
    backgroundColor: colors.border.subtle,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  paginationThumb: {
    height: "100%",
    backgroundColor: colors.brand.primary,
    borderRadius: radius.full,
  },
  paginationText: {
    ...typography.labelSmall,
    color: colors.text.tertiary,
  },
});

export default SecondChoicesCarousel;

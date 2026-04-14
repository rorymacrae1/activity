/**
 * FavoritesBasedRecommendations
 * Shows resorts similar to the user's favorite/visited resorts
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { SimilarResortsCarousel } from "@/components/resort/SimilarResortsCarousel";
import { getSimilarResorts, getResortByIdAsync } from "@/services/resort";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { Resort } from "@/types/resort";

interface FavoritesBasedRecommendationsProps {
  /** The resort ID to base recommendations on (usually top favorite) */
  baseResortId: string;
  /** Optional custom heading */
  heading?: string;
}

/**
 * Shows resorts similar to a user's favorite resort.
 * Used on the personalized home screen.
 */
export function FavoritesBasedRecommendations({
  baseResortId,
  heading,
}: FavoritesBasedRecommendationsProps) {
  const [baseResort, setBaseResort] = useState<Resort | null>(null);
  const [similarResorts, setSimilarResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      try {
        const [base, similar] = await Promise.all([
          getResortByIdAsync(baseResortId),
          getSimilarResorts(baseResortId, 6),
        ]);
        setBaseResort(base ?? null);
        setSimilarResorts(similar);
      } catch (_e: unknown) {
        // Silently fail - will show empty state
      }
      setLoading(false);
    }
    loadRecommendations();
  }, [baseResortId]);

  if (loading || similarResorts.length === 0) {
    return null;
  }

  const displayHeading =
    heading ?? `You loved ${baseResort?.name ?? "this resort"}`;

  return (
    <View style={styles.container}>
      <SimilarResortsCarousel
        resorts={similarResorts}
        heading={displayHeading}
        subheading="These resorts are similar"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
});

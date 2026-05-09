/**
 * FavoritesBasedRecommendations
 * Shows resorts similar to the user's favorite/visited resorts
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SimilarResortsCarousel } from "@/components/resort/SimilarResortsCarousel";
import { getSimilarResorts, getResortByIdAsync } from "@/services/resort";
import { spacing } from "@/theme/spacing";
import { useContent } from "@/hooks/useContent";
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
  const t = useContent().home.recommendations;
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
    heading ??
    (baseResort?.name
      ? t.heading.replace("{name}", baseResort.name)
      : t.fallbackHeading);

  return (
    <View style={styles.container}>
      <SimilarResortsCarousel
        resorts={similarResorts}
        heading={displayHeading}
        subheading={t.subheading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
});

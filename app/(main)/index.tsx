import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@/stores/preferences";
import { getRecommendations } from "@/services/recommendation";
import { useLayout } from "@/hooks/useLayout";
import { colors, spacing } from "@/theme";
import { Text } from "@/components/ui/Text";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ResortCard } from "@/components/resort/ResortCard";
import type { RecommendationResult } from "@/types/recommendation";

export default function DiscoverScreen() {
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { numColumns, hPadding } = useLayout();

  useEffect(() => {
    // Get preferences snapshot once on mount (not as a reactive selector)
    const preferences = usePreferencesStore.getState().getPreferencesInput();
    getRecommendations(preferences)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState icon="🎿" message="Loading recommendations..." />
      </ScreenContainer>
    );
  }

  if (results.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="🤔"
          title="No matches found"
          message="Try adjusting your preferences in your profile."
          action={{
            label: "Update Preferences",
            onPress: () => router.push("/(main)/profile"),
          }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noMaxWidth>
      <FlatList
        data={results}
        keyExtractor={(item) => item.resort.id}
        numColumns={numColumns}
        key={numColumns} // force re-render when columns change (orientation)
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        ListHeaderComponent={
          <View style={[styles.header, { paddingHorizontal: hPadding }]}>
            <SectionHeader
              title="Your Matches"
              action={{
                label: "Retake Quiz",
                onPress: () => router.replace("/(onboarding)"),
              }}
            />
            <Text variant="bodySmall" color={colors.text.secondary}>
              {results.length} resorts matched your preferences
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={numColumns > 1 ? styles.columnItem : styles.singleItem}>
            <ResortCard
              result={item}
              rank={index + 1}
              onPress={() => router.push(`/(main)/resort/${item.resort.id}`)}
            />
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: hPadding },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xxs,
  },
  listContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  columnItem: {
    flex: 1,
  },
  singleItem: {
    flex: 1,
  },
});

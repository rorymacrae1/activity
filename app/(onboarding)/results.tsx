import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@/stores/preferences";
import { getRecommendations } from "@/services/recommendation";
import { useLayout } from "@/hooks/useLayout";
import { colors, spacing } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ResortCard } from "@/components/resort/ResortCard";
import type { RecommendationResult } from "@/types/recommendation";

export default function ResultsScreen() {
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const setHasCompletedOnboarding = usePreferencesStore(
    (state) => state.setHasCompletedOnboarding,
  );
  const { numColumns, hPadding } = useLayout();

  useEffect(() => {
    // Get preferences snapshot once on mount (not as a reactive selector)
    const preferences = usePreferencesStore.getState().getPreferencesInput();
    getRecommendations(preferences)
      .then((recs) => {
        setResults(recs);
        setHasCompletedOnboarding(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [setHasCompletedOnboarding]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState icon="🎿" message="Finding your perfect resorts..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noMaxWidth>
      <FlatList
        data={results}
        keyExtractor={(item) => item.resort.id}
        numColumns={numColumns}
        key={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        ListHeaderComponent={
          <View style={[styles.header, { paddingHorizontal: hPadding }]}>
            <Text variant="h1">Your Top Matches</Text>
            <Text variant="body" color={colors.text.secondary}>
              Based on your preferences
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
        ListEmptyComponent={
          <EmptyState
            icon="🤔"
            title="No matches found"
            message="Try adjusting your preferences."
            action={{
              label: "Retake Quiz",
              onPress: () => router.replace("/(onboarding)"),
            }}
          />
        }
      />
      <View style={[styles.footer, { paddingHorizontal: hPadding }]}>
        <Button
          label="Continue to App"
          onPress={() => router.replace("/(main)")}
          fullWidth
        />
        <Button
          label="Retake Quiz"
          variant="ghost"
          onPress={() => router.replace("/(onboarding)")}
          fullWidth
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xxs,
  },
  listContent: {
    paddingBottom: spacing.md,
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
  footer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
});

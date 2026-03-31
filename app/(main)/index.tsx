import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { getRecommendations } from "@services/recommendation";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing } from "@theme";
import { Text } from "@components/ui/Text";
import { SectionHeader } from "@components/ui/SectionHeader";
import { LoadingState } from "@components/ui/LoadingState";
import { EmptyState } from "@components/ui/EmptyState";
import { ScreenContainer } from "@components/ui/ScreenContainer";
import { NavHeader } from "@components/ui/NavHeader";
import { ResortCard } from "@components/resort/ResortCard";
import type { RecommendationResult } from "@/types/recommendation";

export default function DiscoverScreen() {
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { numColumns, hPadding } = useLayout();
  const content = useContent();

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
        <LoadingState icon="🎿" message={content.discover.loading} />
      </ScreenContainer>
    );
  }

  if (results.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="🤔"
          title={content.discover.emptyTitle}
          message={content.discover.emptyMessage}
          action={{
            label: content.discover.updatePreferences,
            onPress: () => router.push("/(main)/profile"),
          }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noMaxWidth>
      <Head>
        <title>Your Ski Matches | PisteWise</title>
        <meta
          name="description"
          content="Your personalised ski resort recommendations based on your skill level, budget, and preferences."
        />
      </Head>
      <NavHeader />
      <FlatList
        data={results}
        keyExtractor={(item) => item.resort.id}
        numColumns={numColumns}
        key={numColumns} // force re-render when columns change (orientation)
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        ListHeaderComponent={
          <View style={[styles.header, { paddingHorizontal: hPadding }]}>
            <SectionHeader
              title={content.discover.sectionTitle}
              action={{
                label: content.discover.retakeQuiz,
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

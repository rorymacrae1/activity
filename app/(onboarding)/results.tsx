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
import { Button } from "@components/ui/Button";
import { LoadingState } from "@components/ui/LoadingState";
import { EmptyState } from "@components/ui/EmptyState";
import { ScreenContainer } from "@components/ui/ScreenContainer";
import { ResortCard } from "@components/resort/ResortCard";
import type { RecommendationResult } from "@/types/recommendation";

export default function ResultsScreen() {
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { numColumns, hPadding } = useLayout();
  const content = useContent();

  useEffect(() => {
    // Get preferences snapshot once on mount (not as a reactive selector)
    const preferences = usePreferencesStore.getState().getPreferencesInput();
    const setHasCompletedOnboarding =
      usePreferencesStore.getState().setHasCompletedOnboarding;

    getRecommendations(preferences)
      .then((r) => {
        setResults(r);
        setHasCompletedOnboarding(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message={content.onboarding.results.loading} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noMaxWidth>
      <Head>
        <title>Your Top Ski Matches | PisteWise</title>
        <meta
          name="description"
          content="Your personalised ski resort recommendations are ready. Explore your top matches."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <FlatList
        data={results}
        keyExtractor={(item) => item.resort.id}
        numColumns={numColumns}
        key={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.cols : undefined}
        ListHeaderComponent={
          <View style={[styles.header, { paddingHorizontal: hPadding }]}>
            <View style={styles.headerContent}>
              <Text variant="h1">{content.onboarding.results.title}</Text>
              <Text variant="body" color={colors.text.secondary}>
                {content.onboarding.results.subtitle}
              </Text>
            </View>
            <Button
              label={content.onboarding.results.retake}
              variant="ghost"
              size="compact"
              onPress={() => router.replace("/(onboarding)")}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={numColumns > 1 ? styles.colItem : styles.singleItem}>
            <ResortCard
              result={item}
              rank={index + 1}
              onPress={() => router.push(`/(main)/resort/${item.resort.id}`)}
            />
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingHorizontal: hPadding }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="🤔"
            title={content.onboarding.results.emptyTitle}
            message={content.onboarding.results.emptyMessage}
            action={{
              label: content.onboarding.results.retake,
              onPress: () => router.replace("/(onboarding)"),
            }}
          />
        }
      />
      <View style={[styles.footer, { paddingHorizontal: hPadding }]}>
        <Button
          label={content.onboarding.results.continue}
          onPress={() => router.replace("/(main)")}
          fullWidth
          size="prominent"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerContent: {
    flex: 1,
    gap: spacing.xxs,
  },
  list: {
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  cols: { gap: spacing.lg },
  colItem: { flex: 1 },
  singleItem: { flex: 1 },
  footer: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});

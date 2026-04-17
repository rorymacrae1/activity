import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { useFavoritesStore } from "@stores/favorites";
import { getResortsByIds } from "@services/resort";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { spacing } from "@theme";
import { EmptyState } from "@components/ui/EmptyState";
import { ErrorState } from "@components/ui/ErrorState";
import { SectionHeader } from "@components/ui/SectionHeader";
import { ScreenContainer } from "@components/ui/ScreenContainer";
import { LoadingState } from "@components/ui/LoadingState";
import { ResortCard } from "@components/resort/ResortCard";
import type { Resort } from "@/types/resort";
import type { AttributeScores } from "@/types/recommendation";

const EMPTY_ATTRIBUTE_SCORES: AttributeScores = {
  skill: 0,
  budget: 0,
  vibe: 0,
  activity: 0,
  snow: 0,
};

export default function FavoritesScreen() {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const [favoriteResorts, setFavoriteResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { numColumns, hPadding } = useLayout();
  const content = useContent();

  useEffect(() => {
    async function loadFavorites() {
      setLoading(true);
      setLoadError(false);
      try {
        const resorts = await getResortsByIds(favoriteIds);
        setFavoriteResorts(resorts);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [favoriteIds, retryCount]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading saved resorts..." />
      </ScreenContainer>
    );
  }

  if (loadError) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Couldn't load saved resorts"
          detail="Check your connection and try again."
          onRetry={() => setRetryCount((c) => c + 1)}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noMaxWidth>
      <Head>
        <title>Saved Resorts | PisteWise</title>
        <meta
          name="description"
          content="Your saved ski resorts, ready to compare and revisit."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {favoriteResorts.length === 0 ? (
        <EmptyState
          icon="heart"
          title={content.favorites.emptyTitle}
          message={content.favorites.emptyMessage}
          action={{
            label: content.favorites.discover,
            onPress: () => router.push("/(main)"),
          }}
        />
      ) : (
        <FlatList
          data={favoriteResorts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          ListHeaderComponent={
            <View style={[styles.header, { paddingHorizontal: hPadding }]}>
              <SectionHeader
                title={content.favorites.sectionTitle}
                action={{
                  label: `${favoriteResorts.length} saved`,
                  onPress: () => {},
                }}
              />
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={numColumns > 1 ? styles.columnItem : styles.singleItem}
            >
              <ResortCard
                result={{
                  resort: item,
                  matchScore: 0,
                  matchReasons: [],
                  attributeScores: EMPTY_ATTRIBUTE_SCORES,
                }}
                onPress={() => router.push(`/(main)/resort/${item.id}`)}
                showMatchScore={false}
              />
            </View>
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: hPadding },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
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

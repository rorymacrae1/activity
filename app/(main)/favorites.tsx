import { View, StyleSheet, FlatList } from "react-native";
import { router } from "expo-router";
import { useFavoritesStore } from "@stores/favorites";
import { getResortById } from "@services/resort";
import { useLayout } from "@hooks/useLayout";
import { spacing } from "@theme";
import { EmptyState } from "@components/ui/EmptyState";
import { SectionHeader } from "@components/ui/SectionHeader";
import { ScreenContainer } from "@components/ui/ScreenContainer";
import { ResortCard } from "@components/resort/ResortCard";
import type { AttributeScores } from "@/types/recommendation";

const EMPTY_ATTRIBUTE_SCORES: AttributeScores = {
  skill: 0, budget: 0, vibe: 0, activity: 0, snow: 0,
};

export default function FavoritesScreen() {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const favoriteResorts = favoriteIds.map((id) => getResortById(id)).filter(Boolean);
  const { numColumns, hPadding } = useLayout();

  return (
    <ScreenContainer noMaxWidth>
      {favoriteResorts.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No saved resorts yet"
          message="Tap the heart icon on any resort to save it here."
          action={{ label: "Discover Resorts", onPress: () => router.push("/(main)") }}
        />
      ) : (
        <FlatList
          data={favoriteResorts}
          keyExtractor={(item) => item!.id}
          numColumns={numColumns}
          key={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          ListHeaderComponent={
            <View style={[styles.header, { paddingHorizontal: hPadding }]}>
              <SectionHeader
                title="Saved Resorts"
                action={{ label: `${favoriteResorts.length} saved`, onPress: () => {} }}
              />
            </View>
          }
          renderItem={({ item }) => (
            <View style={numColumns > 1 ? styles.columnItem : styles.singleItem}>
              <ResortCard
                result={{
                  resort: item!,
                  matchScore: 0,
                  matchReasons: [],
                  attributeScores: EMPTY_ATTRIBUTE_SCORES,
                }}
                onPress={() => router.push(`/(main)/resort/${item!.id}`)}
                showMatchScore={false}
              />
            </View>
          )}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: hPadding }]}
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

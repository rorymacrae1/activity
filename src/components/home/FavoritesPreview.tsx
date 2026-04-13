/**
 * FavoritesPreview - Compact preview of user's favorite resorts
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Icon } from "@/components/ui/Icon";
import { ResortImage } from "@/components/ui/ResortImage";
import { getResortByIdAsync } from "@/services/resort";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import type { Resort } from "@/types/resort";

interface FavoritesPreviewProps {
  favoriteIds: string[];
  maxItems?: number;
}

export function FavoritesPreview({
  favoriteIds,
  maxItems = 3,
}: FavoritesPreviewProps) {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResorts() {
      setLoading(true);
      const idsToLoad = favoriteIds.slice(0, maxItems);
      const loaded = await Promise.all(
        idsToLoad.map((id) => getResortByIdAsync(id)),
      );
      setResorts(loaded.filter((r): r is Resort => r !== null));
      setLoading(false);
    }
    if (favoriteIds.length > 0) {
      loadResorts();
    } else {
      setLoading(false);
    }
  }, [favoriteIds, maxItems]);

  if (loading) {
    return null;
  }

  if (resorts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h3" style={styles.heading}>
            Your Favorites
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.emptyState,
            pressed && styles.emptyStatePressed,
          ]}
          onPress={() => router.push("/(onboarding)/results")}
          accessibilityRole="button"
          accessibilityLabel="Browse resorts to add favorites"
        >
          <View style={styles.emptyIcon}>
            <Icon
              name="heart"
              size={32}
              color={colors.sentiment.error}
              strokeWidth={1.5}
            />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Tap to browse resorts and save your favorites
          </Text>
          <View style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Browse Resorts →</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  const remainingCount = favoriteIds.length - resorts.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h3" style={styles.heading}>
          Your Favorites
        </Text>
        <Pressable
          onPress={() => router.push("/(main)/favorites")}
          accessibilityRole="button"
          accessibilityLabel="View all favorites"
        >
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.previewList}>
        {resorts.map((resort) => (
          <Pressable
            key={resort.id}
            style={({ pressed }) => [
              styles.resortItem,
              pressed && styles.resortItemPressed,
            ]}
            onPress={() => router.push(`/(main)/resort/${resort.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${resort.name}, ${resort.country}`}
          >
            <ResortImage
              uri={resort.assets.heroImage}
              style={styles.resortImage}
              accessibilityLabel={`${resort.name} ski resort`}
            />
            <View style={styles.resortInfo}>
              <Text style={styles.resortName} numberOfLines={1}>
                {resort.name}
              </Text>
              <Text style={styles.resortLocation} numberOfLines={1}>
                {resort.region}, {resort.country}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}

        {remainingCount > 0 && (
          <Pressable
            style={styles.moreItem}
            onPress={() => router.push("/(main)/favorites")}
            accessibilityRole="button"
          >
            <Text style={styles.moreCount}>+{remainingCount}</Text>
            <Text style={styles.moreLabel}>
              more {remainingCount === 1 ? "resort" : "resorts"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  heading: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  emptyState: {
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderStyle: "dashed",
  },
  emptyStatePressed: {
    backgroundColor: colors.surface.tertiary,
  },
  emptyIcon: {
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  emptyButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "600",
  },
  previewList: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    ...shadows.sm,
    overflow: "hidden",
  },
  resortItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  resortItemPressed: {
    backgroundColor: colors.surface.secondary,
  },
  resortImage: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    marginRight: spacing.md,
  },
  resortInfo: {
    flex: 1,
  },
  resortName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  resortLocation: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  chevron: {
    fontSize: 22,
    color: colors.text.tertiary,
    fontWeight: "300",
  },
  moreItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.surface.secondary,
  },
  moreCount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  moreLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

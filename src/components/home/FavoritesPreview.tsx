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
import { typography } from "@/theme/typography";
import { useContent } from "@/hooks/useContent";
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
  const t = useContent().home.favoritesPreview;

  useEffect(() => {
    async function loadResorts() {
      setLoading(true);
      const idsToLoad = favoriteIds.slice(0, maxItems);
      try {
        const loaded = await Promise.all(
          idsToLoad.map((id) => getResortByIdAsync(id)),
        );
        setResorts(loaded.filter((r): r is Resort => r !== null));
      } catch {
        // Silently fail — preview just won't show
      } finally {
        setLoading(false);
      }
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
            {t.heading}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.emptyState,
            pressed && styles.emptyStatePressed,
          ]}
          onPress={() => router.push("/(onboarding)/results")}
          accessibilityRole="button"
          accessibilityLabel={t.emptyButton}
        >
          <View style={styles.emptyIcon}>
            <Icon
              name="heart"
              size={32}
              color={colors.sentiment.error}
              strokeWidth={1.5}
            />
          </View>
          <Text style={styles.emptyTitle}>{t.emptyTitle}</Text>
          <Text style={styles.emptyText}>{t.emptyText}</Text>
          <View style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>{t.emptyButton}</Text>
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
          {t.heading}
        </Text>
        <Pressable
          onPress={() => router.push("/(main)/favorites")}
          accessibilityRole="button"
          accessibilityLabel={t.viewAll}
        >
          <Text style={styles.viewAll}>{t.viewAll}</Text>
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
                {resort.region !== resort.country ? `${resort.region}, ${resort.country}` : resort.country}
              </Text>
            </View>
            <Icon
              name="chevron-right"
              size={16}
              color={colors.ink.muted}
              strokeWidth={1.5}
            />
          </Pressable>
        ))}

        {remainingCount > 0 && (
          <Pressable
            style={styles.moreItem}
            onPress={() => router.push("/(main)/favorites")}
            accessibilityRole="button"
            accessibilityLabel={`${remainingCount} ${remainingCount === 1 ? t.moreResort : t.moreResorts}`}
          >
            <Text style={styles.moreCount}>+{remainingCount}</Text>
            <Text style={styles.moreLabel}>
              {remainingCount === 1 ? t.moreResort : t.moreResorts}
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
    ...typography.sectionTitle,
    color: colors.ink.rich,
  },
  viewAll: {
    ...typography.label,
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
    ...typography.bodyMedium,
    color: colors.ink.rich,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.ink.normal,
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
    ...typography.label,
    color: colors.ink.inverse,
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
    ...typography.bodyMedium,
    color: colors.ink.rich,
    marginBottom: spacing.xxs,
  },
  resortLocation: {
    ...typography.bodySmall,
    color: colors.ink.normal,
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
    ...typography.label,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  moreLabel: {
    ...typography.body,
    color: colors.ink.normal,
  },
});

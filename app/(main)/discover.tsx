/**
 * Discover Screen — Search and filter all ski resorts.
 *
 * UX flow:
 *  1. Search bar — filters by name, country, region
 *  2. Country filter chips — quick-select by destination
 *  3. Sort toggle — A–Z / Most km / Best snow
 *  4. Live results list — compact resort rows
 */

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllResortsAsync } from "@services/resort";
import { useFavoritesStore } from "@stores/favorites";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { usePrefetchImages } from "@hooks/usePrefetchImages";
import { colors, spacing, radius, typography } from "@theme";
import { Text } from "@components/ui/Text";
import { Icon } from "@components/ui/Icon";
import { LoadingState } from "@components/ui/LoadingState";
import { EmptyState } from "@components/ui/EmptyState";
import { ResortImage } from "@components/ui/ResortImage";
import { ResortScatterPlot } from "@components/resort/ResortScatterPlot";
import {
  DiscoverControls,
  type DiscoverPrefs,
} from "@components/resort/DiscoverControls";
import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortKey = "az" | "km" | "snow";
type ViewMode = "list" | "map";

// ─── Constants ───────────────────────────────────────────────────────────────

const SKILL_MAP: Record<string, number> = {
  beginner: 0,
  intermediate: 0.33,
  red: 0.67,
  advanced: 1,
};

const BUDGET_MAP: Record<string, number> = {
  budget: 0,
  mid: 0.33,
  premium: 0.67,
  luxury: 1,
};

/** Neutral fallback preferences when user has not completed onboarding */
const NEUTRAL_PREFS: DiscoverPrefs = {
  minSkill: 0.33,
  maxSkill: 0.33,
  budgetLevel: 0.33,
  quietLively: 0.5,
  familyNightlife: 0.5,
  snowImportance: 0.5,
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "az", label: "A – Z" },
  { key: "km", label: "Most km" },
  { key: "snow", label: "Best snow" },
];

// ─── Resort Row ──────────────────────────────────────────────────────────────

interface ResortRowProps {
  resort: Resort;
  isFavorite: boolean;
}

function ResortRow({ resort, isFavorite }: ResortRowProps) {
  const handlePress = () => {
    router.push({
      pathname: "/(main)/resort/[id]",
      params: { id: resort.id },
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${resort.name}, ${resort.country}`}
    >
      {/* Left: resort thumbnail */}
      <ResortImage
        uri={resort.assets.heroImage}
        style={styles.rowThumb}
        accessibilityLabel={resort.name}
      />

      {/* Centre: name + location + stats */}
      <View style={styles.rowBody}>
        <View style={styles.rowNameRow}>
          <Text style={styles.rowName} numberOfLines={1}>
            {resort.name}
          </Text>
          {isFavorite && <View style={styles.savedDot} />}
        </View>
        <Text style={styles.rowLocation} numberOfLines={1}>
          {resort.region === resort.country
            ? resort.country
            : `${resort.country} · ${resort.region}`}
        </Text>

        {/* Key stats */}
        <View style={styles.rowStats}>
          <View style={styles.statChip}>
            <Icon
              name="trending-up"
              size={11}
              color={colors.ink.muted}
              strokeWidth={1.5}
            />
            <Text style={styles.statChipText}>{resort.stats.totalKm} km</Text>
          </View>
          <View style={styles.statChip}>
            <Icon
              name="snowflake"
              size={11}
              color={colors.ink.muted}
              strokeWidth={1.5}
            />
            <Text style={styles.statChipText}>
              Snow {resort.attributes.snowReliability}/5
            </Text>
          </View>
        </View>
      </View>

      {/* Right: chevron */}
      <Icon
        name="chevron-right"
        size={16}
        color={colors.ink.faint}
        strokeWidth={1.5}
      />
    </Pressable>
  );
}

// Row height: paddingVertical (12*2=24) + name (20) + location (18) + stats (20) + gaps (~8) = 90
// Separator: 1px
const ROW_HEIGHT = 90;
const SEPARATOR_HEIGHT = 1;
const ITEM_HEIGHT = ROW_HEIGHT + SEPARATOR_HEIGHT;

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function DiscoverScreen() {
  const [allResorts, setAllResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("az");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showRefine, setShowRefine] = useState(false);
  const { isFavorite } = useFavoritesStore();
  const { hPadding } = useLayout();
  const inputRef = useRef<TextInput>(null);

  // Read stored prefs from onboarding quiz
  const storedAbilities = usePreferencesStore((s) => s.groupAbilities);
  const storedBudget = usePreferencesStore((s) => s.budgetLevel);
  const storedCrowd = usePreferencesStore((s) => s.crowdPreference);
  const storedFamily = usePreferencesStore((s) => s.familyVsNightlife);
  const storedSnow = usePreferencesStore((s) => s.snowImportance);
  const hasOnboarded = usePreferencesStore((s) => s.hasCompletedOnboarding);

  // Derive initial scatter plot prefs from stored quiz answers (or neutral)
  const storedDiscoverPrefs = useMemo<DiscoverPrefs>(() => {
    if (!hasOnboarded) return NEUTRAL_PREFS;
    const skillVals =
      storedAbilities.length > 0
        ? storedAbilities.map((s) => SKILL_MAP[s] ?? 0.33)
        : [0.33];
    return {
      minSkill: Math.min(...skillVals),
      maxSkill: Math.max(...skillVals),
      budgetLevel: BUDGET_MAP[storedBudget ?? "mid"] ?? 0.33,
      quietLively: (storedCrowd - 1) / 4,
      familyNightlife: (storedFamily - 1) / 4,
      snowImportance: (storedSnow - 1) / 4,
    };
  }, [
    hasOnboarded,
    storedAbilities,
    storedBudget,
    storedCrowd,
    storedFamily,
    storedSnow,
  ]);

  const [discoverPrefs, setDiscoverPrefs] =
    useState<DiscoverPrefs>(NEUTRAL_PREFS);

  // Sync control prefs when stored prefs load (only once after load)
  useEffect(() => {
    setDiscoverPrefs(storedDiscoverPrefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasOnboarded]);

  // Build full NormalizedPreferences for the scatter plot
  const normalizedPrefs = useMemo<NormalizedPreferences>(
    () => ({
      ...discoverPrefs,
      tripType: null,
      regions: [],
    }),
    [discoverPrefs],
  );

  // Load all resorts on mount
  useEffect(() => {
    getAllResortsAsync()
      .then(setAllResorts)
      .finally(() => setLoading(false));
  }, []);

  // Prefetch hero images for visible resorts
  usePrefetchImages(allResorts);

  // Filtered + sorted results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let filtered = allResorts.filter((r) => {
      // Text search: name, country, region
      if (q) {
        return (
          r.name.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q)
        );
      }
      return true;
    });

    // Sort
    switch (sortKey) {
      case "az":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "km":
        filtered = [...filtered].sort(
          (a, b) => b.stats.totalKm - a.stats.totalKm,
        );
        break;
      case "snow":
        filtered = [...filtered].sort(
          (a, b) => b.attributes.snowReliability - a.attributes.snowReliability,
        );
        break;
    }

    return filtered;
  }, [allResorts, query, sortKey]);

  const handleClearQuery = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  const renderRow = useCallback(
    ({ item }: { item: Resort }) => (
      <ResortRow resort={item} isFavorite={isFavorite(item.id)} />
    ),
    [isFavorite],
  );

  const keyExtractor = useCallback((item: Resort) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<Resort> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <LoadingState message="Loading resorts…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Head>
        <title>Discover Resorts | PisteWise</title>
        <meta
          name="description"
          content="Search and filter European ski resorts by country, terrain, and conditions."
        />
      </Head>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* ── Page header ── */}
        <View style={[styles.pageHeader, { paddingHorizontal: hPadding }]}>
          <View style={styles.pageHeaderRow}>
            <View style={styles.pageHeaderText}>
              <Text variant="h2" style={styles.pageTitle}>
                Discover
              </Text>
              <Text variant="body" style={styles.pageSubtitle}>
                {allResorts.length} ski resorts
              </Text>
            </View>

            {/* View toggle: List | Map */}
            <View style={styles.viewToggle}>
              <Pressable
                style={[
                  styles.viewToggleBtn,
                  viewMode === "list" && styles.viewToggleBtnActive,
                ]}
                onPress={() => setViewMode("list")}
                accessibilityRole="button"
                accessibilityLabel="List view"
                accessibilityState={{ selected: viewMode === "list" }}
              >
                <Icon
                  name="list"
                  size={15}
                  color={
                    viewMode === "list"
                      ? colors.brand.primary
                      : colors.ink.muted
                  }
                  strokeWidth={2}
                />
              </Pressable>
              <Pressable
                style={[
                  styles.viewToggleBtn,
                  viewMode === "map" && styles.viewToggleBtnActive,
                ]}
                onPress={() => setViewMode("map")}
                accessibilityRole="button"
                accessibilityLabel="Scatter plot view"
                accessibilityState={{ selected: viewMode === "map" }}
              >
                <Icon
                  name="grid"
                  size={15}
                  color={
                    viewMode === "map" ? colors.brand.primary : colors.ink.muted
                  }
                  strokeWidth={2}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Search / chips / sort (list) OR preference controls (map) ── */}
        {viewMode === "list" ? (
          <>
            {/* Search bar */}
            <View
              style={[styles.searchContainer, { paddingHorizontal: hPadding }]}
            >
              <View style={styles.searchBar}>
                <Icon
                  name="search"
                  size={18}
                  color={colors.ink.muted}
                  strokeWidth={1.75}
                />
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  placeholder="Search by name, country or region…"
                  placeholderTextColor={colors.ink.faint}
                  value={query}
                  onChangeText={setQuery}
                  returnKeyType="search"
                  clearButtonMode="never"
                  autoCorrect={false}
                  autoCapitalize="none"
                  accessibilityLabel="Search resorts"
                  accessibilityRole="search"
                />
                {query.length > 0 && (
                  <Pressable
                    onPress={handleClearQuery}
                    hitSlop={8}
                    accessibilityLabel="Clear search"
                    accessibilityRole="button"
                  >
                    <View style={styles.clearButton}>
                      <Icon
                        name="x"
                        size={14}
                        color={colors.ink.muted}
                        strokeWidth={2}
                      />
                    </View>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Sort row */}
            <View style={[styles.sortRow, { paddingHorizontal: hPadding }]}>
              <View style={styles.sortLeft}>
                <Text style={styles.sortLabel}>Sort:</Text>
                {SORT_OPTIONS.map((opt) => {
                  const active = sortKey === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      style={[styles.sortChip, active && styles.sortChipActive]}
                      onPress={() => setSortKey(opt.key)}
                      accessibilityRole="button"
                      accessibilityLabel={`Sort by ${opt.label}`}
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        style={[
                          styles.sortChipText,
                          active && styles.sortChipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.sortRight}>
                <Pressable
                  style={[styles.refineChip, showRefine && styles.refineChipActive]}
                  onPress={() => setShowRefine((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle refine panel"
                  accessibilityState={{ selected: showRefine }}
                >
                  <Icon
                    name="sliders-horizontal"
                    size={13}
                    color={showRefine ? colors.ink.inverse : colors.ink.normal}
                    strokeWidth={2}
                  />
                  <Text style={[styles.refineChipText, showRefine && styles.refineChipTextActive]}>
                    Refine
                  </Text>
                </Pressable>
                <Text style={styles.resultsCount}>
                  {results.length} resort{results.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
            {/* Inline refine controls — shown when Refine is toggled */}
            {showRefine ? (
              <DiscoverControls value={discoverPrefs} onChange={setDiscoverPrefs} />
            ) : null}
          </>
        ) : (
          <View style={{ paddingHorizontal: hPadding }}>
            <DiscoverControls value={discoverPrefs} onChange={setDiscoverPrefs} />
          </View>
        )}

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Content: list or scatter plot ── */}
        {viewMode === "map" ? (
          <View
            style={[
              styles.flex,
              styles.scatterWrapper,
              { paddingHorizontal: hPadding },
            ]}
          >
            <ResortScatterPlot resorts={allResorts} prefs={normalizedPrefs} />
          </View>
        ) : results.length === 0 ? (
          <EmptyState
            icon="search"
            title="No resorts found"
            message={
              query
                ? `No resorts match "${query}". Try a different search.`
                : "Start typing to search for resorts."
            }
            action={{
              label: "Clear search",
              onPress: () => setQuery(""),
            }}
          />
        ) : (
          <FlatList
            data={results}
            renderItem={renderRow}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            ItemSeparatorComponent={ItemSeparator}
            style={styles.flex}
            contentContainerStyle={[
              styles.listContent,
              { paddingHorizontal: hPadding },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={Platform.OS !== "web"}
            maxToRenderPerBatch={15}
            windowSize={10}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas.default,
  },
  flex: {
    flex: 1,
  },

  // Page header
  pageHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pageHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  pageHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  pageTitle: {
    color: colors.ink.rich,
  },
  pageSubtitle: {
    ...typography.bodySmall,
    color: colors.ink.muted,
  },

  // View toggle (List | Map)
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.canvas.muted,
    borderRadius: radius.sm,
    padding: 2,
    gap: 1,
  },
  viewToggleBtn: {
    padding: spacing.xs + 2,
    borderRadius: radius.xs,
  },
  viewToggleBtnActive: {
    backgroundColor: colors.surface.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },

  // Search
  searchContainer: {
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink.rich,
    paddingVertical: 0,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sort
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
  },
  sortLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  sortLabel: {
    ...typography.labelSmall,
    color: colors.ink.muted,
    marginRight: spacing.xs,
  },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  sortChipActive: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.brand.primary,
  },
  sortChipText: {
    ...typography.labelSmall,
    color: colors.ink.muted,
  },
  sortChipTextActive: {
    color: colors.brand.primary,
    fontWeight: "600" as const,
  },
  resultsCount: {
    ...typography.caption,
    color: colors.ink.faint,
  },
  sortRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  refineChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.transparent,
  },
  refineChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  refineChipText: {
    ...typography.labelSmall,
    color: colors.ink.normal,
  },
  refineChipTextActive: {
    color: colors.ink.inverse,
    fontWeight: "600" as const,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginBottom: spacing.xs,
  },

  // List
  listContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing["3xl"],
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },

  // Scatter plot
  scatterWrapper: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },

  // Resort row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface.primary,
  },
  rowPressed: {
    backgroundColor: colors.canvas.subtle,
  },
  rowThumb: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  rowName: {
    ...typography.bodyMedium,
    color: colors.ink.rich,
    flex: 1,
  },
  savedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brand.accent,
    flexShrink: 0,
  },
  rowLocation: {
    ...typography.bodySmall,
    color: colors.ink.muted,
  },
  rowStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: 2,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.canvas.subtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statChipText: {
    ...typography.caption,
    color: colors.ink.muted,
    fontWeight: "500" as const,
  },
});

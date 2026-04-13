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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllResortsAsync } from "@services/resort";
import { useFavoritesStore } from "@stores/favorites";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Icon } from "@components/ui/Icon";
import { LoadingState } from "@components/ui/LoadingState";
import { EmptyState } from "@components/ui/EmptyState";
import type { Resort } from "@/types/resort";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortKey = "az" | "km" | "snow";

interface CountryFilter {
  id: string;
  label: string;
  flag: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COUNTRY_FILTERS: CountryFilter[] = [
  { id: "all", label: "All", flag: "🌍" },
  { id: "France", label: "France", flag: "🇫🇷" },
  { id: "Austria", label: "Austria", flag: "🇦🇹" },
  { id: "Switzerland", label: "Switzerland", flag: "🇨🇭" },
  { id: "Italy", label: "Italy", flag: "🇮🇹" },
  { id: "Andorra", label: "Andorra", flag: "🇦🇩" },
  { id: "Spain", label: "Spain", flag: "🇪🇸" },
];

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
      {/* Left: mountain icon */}
      <View style={styles.rowIcon}>
        <Icon
          name="mountain"
          size={18}
          color={colors.brand.primary}
          strokeWidth={1.75}
        />
      </View>

      {/* Centre: name + location */}
      <View style={styles.rowBody}>
        <View style={styles.rowNameRow}>
          <Text style={styles.rowName} numberOfLines={1}>
            {resort.name}
          </Text>
          {isFavorite && <View style={styles.savedDot} />}
        </View>
        <Text style={styles.rowLocation} numberOfLines={1}>
          {resort.country} · {resort.region}
        </Text>

        {/* Stats chips */}
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
          <View style={styles.statChip}>
            <Text style={styles.statChipText}>
              {resort.terrain.beginner}% beginner
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
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("az");
  const { isFavorite } = useFavoritesStore();
  const { hPadding } = useLayout();
  const inputRef = useRef<TextInput>(null);

  // Load all resorts on mount
  useEffect(() => {
    getAllResortsAsync()
      .then(setAllResorts)
      .finally(() => setLoading(false));
  }, []);

  // Filtered + sorted results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let filtered = allResorts.filter((r) => {
      // Country filter
      if (selectedCountry !== "all" && r.country !== selectedCountry) {
        return false;
      }
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
  }, [allResorts, query, selectedCountry, sortKey]);

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
      length: ROW_HEIGHT,
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
          <Text variant="h2" style={styles.pageTitle}>
            Discover
          </Text>
          <Text variant="body" style={styles.pageSubtitle}>
            {allResorts.length} European ski resorts
          </Text>
        </View>

        {/* ── Search bar ── */}
        <View style={[styles.searchContainer, { paddingHorizontal: hPadding }]}>
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

        {/* ── Country filter chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={[
            styles.filterRow,
            { paddingHorizontal: hPadding },
          ]}
        >
          {COUNTRY_FILTERS.map((f) => {
            const active = selectedCountry === f.id;
            return (
              <Pressable
                key={f.id}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setSelectedCountry(f.id)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${f.label}`}
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {f.flag} {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Sort options ── */}
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

          {/* Results count */}
          <Text style={styles.resultsCount}>
            {results.length} resort{results.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Results list ── */}
        {results.length === 0 ? (
          <EmptyState
            icon="search"
            title="No resorts found"
            message={
              query
                ? `No resorts match "${query}". Try a different name or country.`
                : "No resorts match your current filters."
            }
            action={{
              label: "Clear filters",
              onPress: () => {
                setQuery("");
                setSelectedCountry("all");
              },
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
    gap: spacing.xs,
  },
  pageTitle: {
    color: colors.ink.rich,
  },
  pageSubtitle: {
    color: colors.ink.muted,
    fontSize: 14,
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

  // Country filter chips
  filterScroll: {
    flexShrink: 0, // prevents height collapse on Android
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primarySubtle,
    borderColor: colors.brand.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.ink.normal,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: colors.brand.primaryStrong,
    fontWeight: "600",
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
    fontSize: 13,
    color: colors.ink.muted,
    marginRight: spacing.xs,
  },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.transparent,
  },
  sortChipActive: {
    backgroundColor: colors.canvas.muted,
  },
  sortChipText: {
    fontSize: 13,
    color: colors.ink.muted,
    fontWeight: "500",
  },
  sortChipTextActive: {
    color: colors.ink.rich,
    fontWeight: "600",
  },
  resultsCount: {
    fontSize: 12,
    color: colors.ink.faint,
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
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 15,
    fontWeight: "600",
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
    fontSize: 13,
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
    fontSize: 11,
    color: colors.ink.muted,
    fontWeight: "500",
  },
});

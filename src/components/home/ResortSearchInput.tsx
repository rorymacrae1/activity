/**
 * ResortSearchInput
 * Searchable input for selecting resorts from the database.
 * Uses fuzzy matching and falls back to an async fetch if the cache is cold.
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { getAllResorts, getAllResortsAsync } from "@/services/resort";
import { fuzzyScoreMulti } from "@/lib/fuzzyMatch";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import type { Resort } from "@/types/resort";

interface ResortSearchInputProps {
  /** Called when a resort is selected */
  onSelect: (resort: Resort) => void;
  /** Placeholder text */
  placeholder?: string;
  /** IDs of resorts to exclude from results (already selected) */
  excludeIds?: string[];
}

/**
 * Search input with autocomplete for resorts.
 */
export function ResortSearchInput({
  onSelect,
  placeholder = "Search resorts...",
  excludeIds = [],
}: ResortSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Resort[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [allResorts, setAllResorts] = useState<Resort[]>(() => getAllResorts());

  // Warm the cache on mount if it is empty
  useEffect(() => {
    if (allResorts.length === 0) {
      getAllResortsAsync().then((resorts) => setAllResorts(resorts));
    }
  }, [allResorts.length]);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      const scored = allResorts
        .filter((r) => !excludeIds.includes(r.id))
        .map((r) => ({
          resort: r,
          score: fuzzyScoreMulti(text, [r.name, r.country, r.region]),
        }))
        .filter((item) => item.score > 0);

      scored.sort((a, b) => b.score - a.score);
      const filtered = scored.slice(0, 6).map((item) => item.resort);

      setResults(filtered);
      setShowResults(filtered.length > 0);
    },
    [allResorts, excludeIds],
  );

  const handleSelect = (resort: Resort) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    Keyboard.dismiss();
    onSelect(resort);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleSearch}
        placeholder={placeholder}
        placeholderTextColor={colors.ink.muted}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Search resorts"
        accessibilityRole="search"
        onFocus={() => query.length >= 2 && setShowResults(results.length > 0)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />

      {showResults && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.resultItem,
                  pressed && styles.resultItemPressed,
                ]}
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.region}, ${item.country}`}
              >
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultLocation}>
                  {item.region}, {item.country}
                </Text>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.ink.rich,
    backgroundColor: colors.surface.primary,
  },
  resultsContainer: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    zIndex: 999,
    overflow: "hidden",
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    ...shadows.raised,
    maxHeight: 250,
  },
  resultItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resultItemPressed: {
    backgroundColor: colors.surface.secondary,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.ink.rich,
  },
  resultLocation: {
    fontSize: 14,
    color: colors.ink.normal,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surface.divider,
  },
});

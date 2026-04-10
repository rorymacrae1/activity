/**
 * ResortSearchInput
 * Searchable input for selecting resorts from the database
 */

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { getAllResorts } from "@/services/resort";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
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

  const allResorts = getAllResorts();

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      const searchTerm = text.toLowerCase();
      const filtered = allResorts
        .filter(
          (r) =>
            !excludeIds.includes(r.id) &&
            (r.name.toLowerCase().includes(searchTerm) ||
              r.country.toLowerCase().includes(searchTerm) ||
              r.region.toLowerCase().includes(searchTerm)),
        )
        .slice(0, 5);

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
        placeholderTextColor={colors.text.tertiary}
        autoCapitalize="none"
        autoCorrect={false}
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
              >
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultLocation}>
                  {item.region}, {item.country}
                </Text>
              </Pressable>
            )}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
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
    color: colors.text.primary,
    backgroundColor: colors.surface.primary,
  },
  resultsContainer: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 250,
  },
  resultItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.divider,
  },
  resultItemPressed: {
    backgroundColor: colors.surface.secondary,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  resultLocation: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

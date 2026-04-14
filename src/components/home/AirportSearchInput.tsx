/**
 * AirportSearchInput
 * Fuzzy-search input backed by the OpenFlights static dataset.
 * Calls onSelect with the chosen Airport (caller saves airport.iata).
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { fuzzyScoreMulti } from "@/lib/fuzzyMatch";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import type { Airport } from "@/data/airports";

export type { Airport };

interface AirportSearchInputProps {
  /** Called when the user picks an airport */
  onSelect: (airport: Airport) => void;
  /** Currently selected airport (controls the displayed value) */
  selectedAirport?: Airport | null;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Search input with fuzzy autocomplete for airports.
 * Searches IATA code, name, city, and country from the OpenFlights dataset.
 */
export function AirportSearchInput({
  onSelect,
  selectedAirport,
  placeholder = "Search airports...",
}: AirportSearchInputProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);

  // Lazy-load the 540KB airport dataset only when this component mounts
  useEffect(() => {
    import("@/data/airports").then((mod) => setAirports(mod.AIRPORTS));
  }, []);

  const displayValue = isFocused
    ? query
    : selectedAirport
      ? `${selectedAirport.name} (${selectedAirport.iata})`
      : query;

  const results = useMemo(() => {
    if (query.length < 2 || airports.length === 0) return [];

    const scored = airports
      .map((airport) => ({
        airport,
        score: fuzzyScoreMulti(query, [
          airport.iata,
          airport.name,
          airport.city,
          airport.country,
        ]),
      }))
      .filter((item) => item.score > 0);

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 8).map((item) => item.airport);
  }, [query, airports]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // If there's a selected airport, clear display so user can type fresh
    if (selectedAirport) {
      setQuery("");
    }
    setShowResults(query.length >= 2 && results.length > 0);
  }, [selectedAirport, query, results.length]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding so tap on results registers first
    setTimeout(() => {
      setShowResults(false);
      // Restore display of selected airport if user didn't pick a new one
      if (selectedAirport) {
        setQuery("");
      }
    }, 200);
  }, [selectedAirport]);

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    setShowResults(text.length >= 2);
  }, []);

  const handleSelect = useCallback(
    (airport: Airport) => {
      setQuery("");
      setShowResults(false);
      setIsFocused(false);
      Keyboard.dismiss();
      onSelect(airport);
    },
    [onSelect],
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        value={displayValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.iata}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.resultItem,
                  pressed && styles.resultItemPressed,
                ]}
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${item.name}, ${item.city}, ${item.country}`}
              >
                <View style={styles.resultLeft}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultLocation}>
                    {item.city}, {item.country}
                  </Text>
                </View>
                <View style={styles.iataBadge}>
                  <Text style={styles.iataText}>{item.iata}</Text>
                </View>
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
    color: colors.text.primary,
    backgroundColor: colors.surface.primary,
  },
  inputFocused: {
    borderColor: colors.brand.primary,
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
    maxHeight: 320,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resultItemPressed: {
    backgroundColor: colors.surface.secondary,
  },
  resultLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text.primary,
  },
  resultLocation: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  iataBadge: {
    backgroundColor: colors.brand.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    minWidth: 44,
    alignItems: "center",
  },
  iataText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surface.divider,
  },
});

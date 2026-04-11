/**
 * Complete Profile Screen
 * Allows users to set their home airport and add visited resorts
 */

import { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@stores/auth";
import {
  getVisitedResorts,
  addVisitedResort,
  removeVisitedResort,
  getHomeAirport,
  setHomeAirport,
} from "@services/profile";
import { getResortById } from "@services/resort";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Icon } from "@components/ui/Icon";
import { LoadingState } from "@components/ui/LoadingState";
import { ResortSearchInput } from "@components/home/ResortSearchInput";
import { AirportSearchInput } from "@components/home/AirportSearchInput";
import { AIRPORTS } from "@/data/airports";
import type { Resort } from "@/types/resort";
import type { Airport } from "@/data/airports";

interface VisitedResortItem {
  resortId: string;
  resort: Resort | null;
}

export default function CompleteProfileScreen() {
  const { user } = useAuthStore();
  const { hPadding } = useLayout();

  const [loading, setLoading] = useState(true);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [visitedResorts, setVisitedResorts] = useState<VisitedResortItem[]>([]);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const justAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing data
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      const [airport, visited] = await Promise.all([
        getHomeAirport(user.id),
        getVisitedResorts(user.id),
      ]);

      // Reconstruct Airport object from saved IATA code
      if (airport) {
        const found = AIRPORTS.find((a) => a.iata === airport);
        setSelectedAirport(found ?? null);
      }

      // Load resort details for visited resorts
      const visitedWithDetails = await Promise.all(
        visited.map(async (v) => ({
          resortId: v.resort_id,
          resort: getResortById(v.resort_id) ?? null,
        })),
      );
      setVisitedResorts(visitedWithDetails);

      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleAddVisitedResort = async (resort: Resort) => {
    if (!user) return;

    // Optimistic update
    setVisitedResorts((prev) => [...prev, { resortId: resort.id, resort }]);

    // Briefly highlight the new row
    setJustAddedId(resort.id);
    if (justAddedTimer.current) clearTimeout(justAddedTimer.current);
    justAddedTimer.current = setTimeout(() => setJustAddedId(null), 1500);

    const { error } = await addVisitedResort(user.id, resort.id);
    if (error) {
      // Revert on error
      setVisitedResorts((prev) => prev.filter((v) => v.resortId !== resort.id));
      Alert.alert("Error", "Could not add resort. Please try again.");
    }
  };

  const handleRemoveVisitedResort = async (resortId: string) => {
    if (!user) return;

    const removed = visitedResorts.find((v) => v.resortId === resortId);

    // Optimistic update
    setVisitedResorts((prev) => prev.filter((v) => v.resortId !== resortId));

    const { error } = await removeVisitedResort(user.id, resortId);
    if (error && removed) {
      // Revert on error
      setVisitedResorts((prev) => [...prev, removed]);
      Alert.alert("Error", "Could not remove resort. Please try again.");
    }
  };

  const handleSelectAirport = async (airport: Airport) => {
    setSelectedAirport(airport);
    if (!user) return;

    const { error } = await setHomeAirport(user.id, airport.iata);
    if (error) {
      Alert.alert("Error", "Could not save airport. Please try again.");
    }
  };

  const handleDone = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading your profile..." />
      </SafeAreaView>
    );
  }

  const visitedResortIds = visitedResorts.map((v) => v.resortId);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Head>
        <title>Complete Your Profile | PisteWise</title>
      </Head>

      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: hPadding }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text variant="h2" style={styles.headerTitle}>
          Complete Your Profile
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: hPadding },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Resort History Section */}
        <View style={[styles.section, styles.sectionResort]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Icon
                name="mountain"
                size={24}
                color={colors.brand.primary}
                strokeWidth={1.5}
              />
            </View>
            <View>
              <Text variant="h3">Resort History</Text>
              <Text variant="body" color={colors.text.secondary}>
                Enter resorts you have visited before
              </Text>
            </View>
          </View>

          <ResortSearchInput
            onSelect={handleAddVisitedResort}
            placeholder="Search for a resort..."
            excludeIds={visitedResortIds}
          />

          {/* Visited resort chips */}
          {visitedResorts.length > 0 && (
            <View style={styles.visitedList}>
              {visitedResorts.map(({ resortId, resort }) => (
                <View
                  key={resortId}
                  style={[
                    styles.visitedItem,
                    justAddedId === resortId && styles.visitedItemHighlight,
                  ]}
                >
                  <View style={styles.visitedIconWrap}>
                    <Icon
                      name="mountain"
                      size={16}
                      color={colors.brand.primary}
                      strokeWidth={1.5}
                    />
                  </View>
                  <View style={styles.visitedInfo}>
                    <Text style={styles.visitedName}>
                      {resort?.name ?? resortId}
                    </Text>
                    {resort && (
                      <Text style={styles.visitedLocation}>
                        {resort.region} · {resort.country}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleRemoveVisitedResort(resortId)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${resort?.name ?? resortId}`}
                    hitSlop={8}
                  >
                    <Icon
                      name="x"
                      size={14}
                      color={colors.text.secondary}
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Home Airport Section */}
        <View style={[styles.section, styles.sectionAirport]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Icon
                name="plane"
                size={24}
                color={colors.brand.primary}
                strokeWidth={1.5}
              />
            </View>
            <View>
              <Text variant="h3">Home Airport</Text>
              <Text variant="body" color={colors.text.secondary}>
                Where do you usually fly from?
              </Text>
            </View>
          </View>

          <AirportSearchInput
            onSelect={handleSelectAirport}
            selectedAirport={selectedAirport}
            placeholder="Search for your home airport..."
          />
        </View>

        {/* Done Button */}
        <Button
          label="Done"
          onPress={handleDone}
          fullWidth
          style={styles.doneButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.secondary,
  },
  backIcon: {
    fontSize: 18,
    color: colors.text.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
    zIndex: 1,
  },
  sectionResort: {
    zIndex: 2,
  },
  sectionAirport: {
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  visitedList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  visitedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  visitedItemHighlight: {
    backgroundColor: colors.brand.primarySubtle,
    borderColor: colors.brand.primary,
  },
  visitedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surface.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  visitedInfo: {
    flex: 1,
  },
  visitedName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    lineHeight: 20,
  },
  visitedLocation: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.tertiary,
    flexShrink: 0,
  },
  doneButton: {
    marginTop: spacing.lg,
  },
});

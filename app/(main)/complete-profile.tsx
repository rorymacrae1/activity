/**
 * Complete Profile Screen
 * Allows users to set their home airport and add visited resorts
 */

import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
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
import { Card } from "@components/ui/Card";
import { LoadingState } from "@components/ui/LoadingState";
import { ResortSearchInput } from "@components/home/ResortSearchInput";
import type { Resort } from "@/types/resort";

interface VisitedResortItem {
  resortId: string;
  resort: Resort | null;
}

export default function CompleteProfileScreen() {
  const { user } = useAuthStore();
  const { hPadding } = useLayout();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [homeAirportValue, setHomeAirportValue] = useState("");
  const [visitedResorts, setVisitedResorts] = useState<VisitedResortItem[]>([]);

  // Load existing data
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      const [airport, visited] = await Promise.all([
        getHomeAirport(user.id),
        getVisitedResorts(user.id),
      ]);

      setHomeAirportValue(airport ?? "");

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

  const handleSaveAirport = async () => {
    if (!user || !homeAirportValue.trim()) return;

    setSaving(true);
    const { error } = await setHomeAirport(user.id, homeAirportValue.trim());
    setSaving(false);

    if (error) {
      Alert.alert("Error", "Could not save airport. Please try again.");
    }
  };

  const handleDone = () => {
    // Save airport if changed
    if (homeAirportValue.trim()) {
      handleSaveAirport();
    }
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🏔️</Text>
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

          {/* List of visited resorts */}
          {visitedResorts.length > 0 && (
            <View style={styles.visitedList}>
              {visitedResorts.map(({ resortId, resort }) => (
                <View key={resortId} style={styles.visitedItem}>
                  <View style={styles.visitedInfo}>
                    <Text style={styles.visitedName}>
                      {resort?.name ?? resortId}
                    </Text>
                    {resort && (
                      <Text variant="caption" color={colors.text.secondary}>
                        {resort.region}, {resort.country}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleRemoveVisitedResort(resortId)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${resort?.name ?? resortId}`}
                  >
                    <Text style={styles.removeIcon}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Home Airport Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>✈️</Text>
            <View>
              <Text variant="h3">Home Airport</Text>
              <Text variant="body" color={colors.text.secondary}>
                Where do you usually fly from?
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.airportInput}
            value={homeAirportValue}
            onChangeText={setHomeAirportValue}
            placeholder="e.g. Edinburgh Airport"
            placeholderTextColor={colors.text.tertiary}
            onBlur={handleSaveAirport}
          />
        </View>

        {/* Done Button */}
        <Button
          label="Done"
          onPress={handleDone}
          fullWidth
          loading={saving}
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
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionEmoji: {
    fontSize: 28,
    marginTop: -2,
  },
  visitedList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  visitedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  visitedInfo: {
    flex: 1,
  },
  visitedName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.tertiary,
  },
  removeIcon: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  airportInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.surface.primary,
  },
  doneButton: {
    marginTop: spacing.lg,
  },
});

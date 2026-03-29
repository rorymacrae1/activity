import { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useFavoritesStore } from "@stores/favorites";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { SectionHeader } from "@components/ui/SectionHeader";
import { LoadingState } from "@components/ui/LoadingState";
import { ScreenContainer } from "@components/ui/ScreenContainer";

export default function ProfileScreen() {
  const [isResetting, setIsResetting] = useState(false);
  const { skillLevel, budgetLevel, regions, reset } = usePreferencesStore();
  const { favoriteIds, clearAll: clearFavorites } = useFavoritesStore();
  const { hPadding } = useLayout();

  const handleRetakeQuiz = () => {
    Alert.alert("Retake Quiz", "This will reset your preferences. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Retake", style: "destructive", onPress: () => { setIsResetting(true); reset(); router.replace("/(onboarding)"); } },
    ]);
  };

  const handleClearFavorites = () => {
    if (favoriteIds.length === 0) { Alert.alert("No Saved Resorts", "You don't have any saved resorts to clear."); return; }
    Alert.alert("Clear Saved Resorts", `Remove ${favoriteIds.length} saved resort${favoriteIds.length === 1 ? "" : "s"}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: clearFavorites },
    ]);
  };

  if (isResetting) {
    return <ScreenContainer><LoadingState message="Resetting preferences..." /></ScreenContainer>;
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const hasCompletedSetup = skillLevel && budgetLevel && regions.length > 0;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPadding }]}>
        <View style={styles.pageHeader}>
          <Text variant="h1">Profile</Text>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <SectionHeader title="Your Preferences" />
          {!hasCompletedSetup ? (
            <View style={styles.warningBanner}>
              <Text variant="bodySmall" color={colors.warning}>
                ⚠️ Some preferences are not set. Complete the quiz for better recommendations.
              </Text>
            </View>
          ) : null}
          <Card elevation="sm" style={styles.prefsCard}>
            <PrefRow label="Skill Level" value={skillLevel ? capitalize(skillLevel) : "Not set"} />
            <View style={styles.divider} />
            <PrefRow label="Budget" value={budgetLevel ? capitalize(budgetLevel) : "Not set"} />
            <View style={styles.divider} />
            <PrefRow label="Regions" value={regions.length > 0 ? `${regions.length} selected` : "Not set"} />
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <SectionHeader title="Actions" />
          <View style={styles.actions}>
            <Button label="🔄  Retake Quiz" variant="secondary" onPress={handleRetakeQuiz} fullWidth />
            <Button label={`🗑️  Clear Saved Resorts (${favoriteIds.length})`} variant="danger" onPress={handleClearFavorites} fullWidth />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <SectionHeader title="About" />
          <Text variant="bodySmall" color={colors.text.secondary}>
            PeakWise v1.0.0 — Find your perfect ski resort
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function PrefRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.prefRow}>
      <Text variant="body">{label}</Text>
      <Text variant="body" color={colors.text.secondary}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },
  pageHeader: { paddingTop: spacing.lg, paddingBottom: spacing.sm },
  section: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.divider,
  },
  warningBanner: {
    backgroundColor: colors.warningSubtle,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  prefsCard: { marginTop: spacing.xs },
  prefRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  divider: { height: 1, backgroundColor: colors.surface.divider },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
});

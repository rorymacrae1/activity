import { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useFavoritesStore } from "@stores/favorites";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { SectionHeader } from "@components/ui/SectionHeader";
import { LoadingState } from "@components/ui/LoadingState";
import { ScreenContainer } from "@components/ui/ScreenContainer";

export default function ProfileScreen() {
  const [isResetting, setIsResetting] = useState(false);
  const { groupAbilities, budgetLevel, regions, reset, language, setLanguage } = usePreferencesStore();
  const { favoriteIds, clearAll: clearFavorites } = useFavoritesStore();
  const { hPadding } = useLayout();
  const content = useContent();

  const handleRetakeQuiz = () => {
    Alert.alert(content.profile.alerts.retakeTitle, content.profile.alerts.retakeMessage, [
      { text: content.profile.alerts.cancel, style: "cancel" },
      { text: content.profile.alerts.retakeConfirm, style: "destructive", onPress: () => { setIsResetting(true); reset(); router.replace("/(onboarding)"); } },
    ]);
  };

  const handleClearFavorites = () => {
    if (favoriteIds.length === 0) { Alert.alert(content.profile.alerts.noSavedTitle, content.profile.alerts.noSavedMessage); return; }
    const plural = favoriteIds.length === 1 ? "" : "s";
    const clearMessage = content.profile.alerts.clearMessage
      .replace("{count}", String(favoriteIds.length))
      .replace("{plural}", plural);
    Alert.alert(content.profile.alerts.clearTitle, clearMessage, [
      { text: content.profile.alerts.cancel, style: "cancel" },
      { text: content.profile.alerts.clearConfirm, style: "destructive", onPress: clearFavorites },
    ]);
  };

  if (isResetting) {
    return <ScreenContainer><LoadingState message={content.profile.resetLoading} /></ScreenContainer>;
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const hasCompletedSetup = groupAbilities.length > 0 && budgetLevel && regions.length > 0;

  return (
    <ScreenContainer>
      <Head>
        <title>Profile | PeakWise</title>
        <meta name="description" content="Update your ski preferences to get fresh resort recommendations." />
      </Head>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPadding }]}>
        <View style={styles.pageHeader}>
          <Text variant="h1">{content.profile.title}</Text>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <SectionHeader title={content.profile.preferencesSection} />
          {!hasCompletedSetup ? (
            <View style={styles.warningBanner}>
              <Text variant="bodySmall" color={colors.warning}>
                ⚠️ {content.profile.incompleteWarning}
              </Text>
            </View>
          ) : null}
          <Card elevation="subtle" style={styles.prefsCard}>
            <PrefRow label={content.profile.skillLevel} value={groupAbilities.length > 0 ? groupAbilities.map(capitalize).join(", ") : content.profile.notSet} />
            <View style={styles.divider} />
            <PrefRow label={content.profile.budget} value={budgetLevel ? capitalize(budgetLevel) : content.profile.notSet} />
            <View style={styles.divider} />
            <PrefRow
              label={content.profile.regions}
              value={regions.length > 0 ? content.profile.regionsCount.replace("{count}", String(regions.length)) : content.profile.notSet}
            />
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <SectionHeader title={content.profile.actionsSection} />
          <View style={styles.actions}>
            <Button label={`🔄  ${content.profile.retakeQuiz}`} variant="secondary" onPress={handleRetakeQuiz} fullWidth />
            <Button
              label={`🗑️  ${content.profile.clearSaved.replace("{count}", String(favoriteIds.length))}`}
              variant="danger"
              onPress={handleClearFavorites}
              fullWidth
            />
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text variant="h4" style={{ paddingHorizontal: hPadding, marginBottom: spacing.sm }}>
            {content.profile.languageSection}
          </Text>
          <View style={[styles.langRow, { paddingHorizontal: hPadding }]}>
            {(["en", "fr", "de"] as const).map((lang) => {
              const langLabel = lang === "en" ? content.languages.en : lang === "fr" ? content.languages.fr : content.languages.de;
              return (
                <Pressable
                  key={lang}
                  style={[styles.langBtn, language === lang && styles.langBtnActive]}
                  onPress={() => setLanguage(lang)}
                  accessibilityRole="button"
                  accessibilityLabel={langLabel}
                  accessibilityState={{ selected: language === lang }}
                >
                  <Text
                    variant="bodySmall"
                    style={language === lang ? styles.langTextActive : undefined}
                  >
                    {langLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <SectionHeader title={content.profile.aboutSection} />
          <Text variant="bodySmall" color={colors.text.secondary}>
            {content.profile.aboutText}
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
  langRow: { flexDirection: "row", gap: spacing.sm },
  langBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
  },
  langBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langTextActive: { color: "#fff" },
});

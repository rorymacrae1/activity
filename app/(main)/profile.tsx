import { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import ChevronRight from "lucide-react-native/dist/cjs/icons/chevron-right";
import { usePreferencesStore } from "@stores/preferences";
import { useFavoritesStore } from "@stores/favorites";
import { useAuthStore, useIsAuthenticated, useProfile } from "@stores/auth";
import { useVisitedStore } from "@stores/visited";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius, typography } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { SectionHeader } from "@components/ui/SectionHeader";
import { LoadingState } from "@components/ui/LoadingState";
import { ScreenContainer } from "@components/ui/ScreenContainer";

export default function ProfileScreen() {
  const [isResetting, setIsResetting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const {
    groupAbilities,
    budgetLevel,
    regions,
    reset,
    language,
    setLanguage,
    syncToCloud,
  } = usePreferencesStore();
  const {
    favoriteIds,
    clearAll: clearFavorites,
    syncToCloud: syncFavoritesToCloud,
  } = useFavoritesStore();
  const visitedIds = useVisitedStore((s) => s.visitedIds);
  const { signOut, user } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();
  const profile = useProfile();
  const { hPadding } = useLayout();
  const content = useContent();

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? Your local data will be kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setIsSigningOut(true);
            await signOut();
            setIsSigningOut(false);
          },
        },
      ],
    );
  };

  const handleSyncNow = async () => {
    if (!isAuthenticated || !user) return;
    try {
      await Promise.all([syncToCloud(user.id), syncFavoritesToCloud(user.id)]);
      Alert.alert(
        "Sync Complete",
        "Your preferences and favorites have been synced to the cloud.",
      );
    } catch {
      Alert.alert("Sync Failed", "Could not sync your data. Please try again.");
    }
  };

  const handleRetakeQuiz = () => {
    Alert.alert(
      content.profile.alerts.retakeTitle,
      content.profile.alerts.retakeMessage,
      [
        { text: content.profile.alerts.cancel, style: "cancel" },
        {
          text: content.profile.alerts.retakeConfirm,
          style: "destructive",
          onPress: () => {
            setIsResetting(true);
            reset();
            router.replace("/(onboarding)");
          },
        },
      ],
    );
  };

  const handleClearFavorites = () => {
    if (favoriteIds.length === 0) {
      Alert.alert(
        content.profile.alerts.noSavedTitle,
        content.profile.alerts.noSavedMessage,
      );
      return;
    }
    const plural = favoriteIds.length === 1 ? "" : "s";
    const clearMessage = content.profile.alerts.clearMessage
      .replace("{count}", String(favoriteIds.length))
      .replace("{plural}", plural);
    Alert.alert(content.profile.alerts.clearTitle, clearMessage, [
      { text: content.profile.alerts.cancel, style: "cancel" },
      {
        text: content.profile.alerts.clearConfirm,
        style: "destructive",
        onPress: clearFavorites,
      },
    ]);
  };

  if (isResetting || isSigningOut) {
    return (
      <ScreenContainer>
        <LoadingState
          message={
            isSigningOut ? "Signing out..." : content.profile.resetLoading
          }
        />
      </ScreenContainer>
    );
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Filter to only valid SkillLevel values to guard against stale persisted data
  const VALID_SKILLS = new Set(["beginner", "intermediate", "red", "advanced"]);
  const validAbilities = groupAbilities.filter((s) => VALID_SKILLS.has(s));

  const SKILL_LABELS: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    red: "Red runs",
    advanced: "Advanced",
  };

  const hasCompletedSetup =
    validAbilities.length > 0 && budgetLevel && regions.length > 0;

  return (
    <ScreenContainer>
      <Head>
        <title>Profile | PeakWise</title>
        <meta
          name="description"
          content="Update your ski preferences to get fresh resort recommendations."
        />
      </Head>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: hPadding },
        ]}
      >
        {/* ── Profile Hero ── */}
        <View style={styles.profileHero}>
          <View style={styles.heroAvatarWrap}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarInitial}>
                {(isAuthenticated
                  ? (profile?.display_name || user?.email || "U")
                  : "?"
                )
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.heroIdentity}>
            {isAuthenticated ? (
              <>
                <Text style={styles.heroName} numberOfLines={1}>
                  {profile?.display_name || "My Profile"}
                </Text>
                <Text style={styles.heroEmail} numberOfLines={1}>
                  {user?.email}
                </Text>
                <View style={styles.heroStatRow}>
                  <View style={styles.heroStatPill}>
                    <Text style={styles.heroStatText}>
                      💙 {favoriteIds.length}
                    </Text>
                    <Text style={styles.heroStatLabel}>Saved</Text>
                  </View>
                  <View style={styles.heroStatDot} />
                  <View style={styles.heroStatPill}>
                    <Text style={styles.heroStatText}>
                      ✓ {visitedIds.length}
                    </Text>
                    <Text style={styles.heroStatLabel}>Visited</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.heroName}>Welcome</Text>
                <Text style={styles.heroEmail}>
                  Sign in to sync your data across devices
                </Text>
                <Button
                  label="Sign In"
                  onPress={() => router.push("/(auth)/sign-in")}
                  size="compact"
                  style={styles.heroSignIn}
                />
              </>
            )}
          </View>
        </View>

        {/* ── Account (authenticated only) ── */}
        {isAuthenticated && (
          <View style={styles.section}>
            <SectionHeader title="Account" />
            <Card elevation="subtle" style={styles.sectionCard}>
              <View style={styles.accountActions}>
                <Button
                  label="Sync Now"
                  variant="secondary"
                  onPress={handleSyncNow}
                  size="compact"
                />
                <Button
                  label="Sign Out"
                  variant="secondary"
                  onPress={handleSignOut}
                  size="compact"
                />
              </View>
            </Card>
          </View>
        )}

        {/* ── Preferences ── */}
        <View style={styles.section}>
          <SectionHeader
            title={content.profile.preferencesSection}
            action={{ label: "Edit", onPress: handleRetakeQuiz }}
          />
          {!hasCompletedSetup ? (
            <View style={styles.warningBanner}>
              <Text variant="bodySmall" color={colors.sentiment.warning}>
                ⚠️ {content.profile.incompleteWarning}
              </Text>
            </View>
          ) : null}
          <Card elevation="subtle" style={styles.sectionCard}>
            <PrefRow
              label={content.profile.skillLevel}
              value={
                validAbilities.length > 0
                  ? validAbilities
                      .map((s) => SKILL_LABELS[s] ?? capitalize(s))
                      .join(", ")
                  : content.profile.notSet
              }
              onPress={handleRetakeQuiz}
            />
            <View style={styles.divider} />
            <PrefRow
              label={content.profile.budget}
              value={
                budgetLevel
                  ? capitalize(budgetLevel) + " tier"
                  : content.profile.notSet
              }
              onPress={handleRetakeQuiz}
            />
            <View style={styles.divider} />
            <PrefRow
              label={content.profile.regions}
              value={
                regions.length === 0
                  ? content.profile.notSet
                  : regions.length >= 30
                    ? "All regions"
                    : content.profile.regionsCount.replace(
                        "{count}",
                        String(regions.length),
                      )
              }
              onPress={handleRetakeQuiz}
            />
            <View style={styles.divider} />
            <PrefRow
              label="Visited Resorts"
              value={
                visitedIds.length === 0
                  ? content.profile.notSet
                  : `${visitedIds.length} resort${visitedIds.length === 1 ? "" : "s"}`
              }
            />
          </Card>
        </View>

        {/* ── Actions ── */}
        <View style={styles.section}>
          <SectionHeader title={content.profile.actionsSection} />
          <Card elevation="subtle" padding="compact" style={styles.sectionCard}>
            <View style={styles.actions}>
              <Button
                label={content.profile.retakeQuiz}
                variant="secondary"
                onPress={handleRetakeQuiz}
                fullWidth
              />
              {favoriteIds.length > 0 && (
                <Button
                  label={content.profile.clearSaved.replace(
                    "{count}",
                    String(favoriteIds.length),
                  )}
                  variant="danger"
                  onPress={handleClearFavorites}
                  fullWidth
                />
              )}
            </View>
          </Card>
        </View>

        {/* ── Language ── */}
        <View style={styles.section}>
          <SectionHeader title={content.profile.languageSection} />
          <View style={styles.langRow}>
            {(["en", "fr", "de"] as const).map((lang) => {
              const langLabel =
                lang === "en"
                  ? content.languages.en
                  : lang === "fr"
                    ? content.languages.fr
                    : content.languages.de;
              return (
                <Pressable
                  key={lang}
                  style={[
                    styles.langBtn,
                    language === lang && styles.langBtnActive,
                  ]}
                  onPress={() => setLanguage(lang)}
                  accessibilityRole="button"
                  accessibilityLabel={langLabel}
                  accessibilityState={{ selected: language === lang }}
                >
                  <Text
                    variant="bodySmall"
                    style={
                      language === lang ? styles.langTextActive : undefined
                    }
                  >
                    {langLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── About ── */}
        <View style={styles.section}>
          <SectionHeader title={content.profile.aboutSection} />
          <Text variant="bodySmall" color={colors.ink.normal}>
            {content.profile.aboutText}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function PrefRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={styles.prefRow}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text variant="body">{label}</Text>
      <View style={styles.prefRowRight}>
        <Text variant="body" color={colors.ink.normal}>
          {value}
        </Text>
        {onPress && (
          <ChevronRight size={16} color={colors.ink.muted} strokeWidth={1.75} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },

  // ── Profile Hero ──
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.divider,
  },
  heroAvatarWrap: {},
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  heroAvatarInitial: {
    ...typography.h1,
    color: colors.ink.inverse,
  },
  heroIdentity: {
    flex: 1,
    gap: spacing.xs,
  },
  heroName: {
    ...typography.h2,
    color: colors.ink.rich,
  },
  heroEmail: {
    ...typography.bodySmall,
    color: colors.ink.muted,
  },
  heroStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  heroStatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroStatText: {
    ...typography.bodySmall,
    color: colors.ink.rich,
    fontWeight: "600" as const,
  },
  heroStatLabel: {
    ...typography.bodySmall,
    color: colors.ink.muted,
  },
  heroStatDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.ink.muted,
  },
  heroSignIn: {
    marginTop: spacing.sm,
    alignSelf: "flex-start" as const,
  },

  // ── Sections ──
  section: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.divider,
  },
  sectionCard: { marginTop: spacing.xs },
  warningBanner: {
    backgroundColor: colors.sentiment.warningSubtle,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },

  // ── Pref rows ──
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  prefRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.divider,
    marginVertical: spacing.xs,
  },

  // ── Account actions ──
  accountActions: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "flex-end",
    paddingVertical: spacing.xs,
  },

  // ── Actions ──
  actions: { gap: spacing.sm },

  // ── Language ──
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
  langBtnActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  langTextActive: { color: colors.ink.onBrand },
});

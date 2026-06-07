import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import ChevronRight from "lucide-react-native/dist/cjs/icons/chevron-right";
import { showAlert } from "@lib/alert";
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
import { Icon } from "@components/ui/Icon";
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
    showAlert(
      content.profile.syncAlerts.signOutTitle,
      content.profile.syncAlerts.signOutMessage,
      [
        { text: content.profile.syncAlerts.cancel, style: "cancel" },
        {
          text: content.profile.syncAlerts.signOutConfirm,
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
      showAlert(
        content.profile.syncAlerts.signOutTitle,
        content.profile.syncAlerts.syncSuccess,
      );
    } catch {
      showAlert(
        content.profile.syncAlerts.signOutTitle,
        content.profile.syncAlerts.syncError,
      );
    }
  };

  const handleRetakeQuiz = () => {
    showAlert(
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
      showAlert(
        content.profile.alerts.noSavedTitle,
        content.profile.alerts.noSavedMessage,
      );
      return;
    }
    const plural = favoriteIds.length === 1 ? "" : "s";
    const clearMessage = content.profile.alerts.clearMessage
      .replace("{count}", String(favoriteIds.length))
      .replace("{plural}", plural);
    showAlert(content.profile.alerts.clearTitle, clearMessage, [
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
          { paddingBottom: spacing.xxxl },
          { paddingHorizontal: hPadding },
        ]}
      >
        {/* ── Profile Hero ── */}
        <View
          className="flex-row items-center border-b"
          style={{ gap: spacing.lg, paddingVertical: spacing.xl, borderBottomColor: colors.surface.divider }}
        >
          <View>
            <View
              className="items-center justify-center"
              style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.brand.primary }}
            >
              <Text style={{ ...typography.h1, color: colors.ink.inverse }}>
                {(isAuthenticated
                  ? profile?.display_name || user?.email || "U"
                  : "?"
                )
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          </View>
          <View className="flex-1" style={{ gap: spacing.xs }}>
            {isAuthenticated ? (
              <>
                <Text style={{ ...typography.h2, color: colors.ink.rich }} numberOfLines={1}>
                  {profile?.display_name || content.profile.myProfile}
                </Text>
                <Text style={{ ...typography.bodySmall, color: colors.ink.muted }} numberOfLines={1}>
                  {user?.email}
                </Text>
                <View className="flex-row items-center" style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <Icon name="heart" size={14} color={colors.brand.accent} strokeWidth={2} />
                    <Text style={{ ...typography.bodySmall, color: colors.ink.rich, fontWeight: "600" as const }}>
                      {favoriteIds.length}
                    </Text>
                    <Text style={{ ...typography.bodySmall, color: colors.ink.muted }}>Saved</Text>
                  </View>
                  <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: colors.ink.muted }} />
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <Icon name="check" size={14} color={colors.sentiment.success} strokeWidth={2} />
                    <Text style={{ ...typography.bodySmall, color: colors.ink.rich, fontWeight: "600" as const }}>
                      {visitedIds.length}
                    </Text>
                    <Text style={{ ...typography.bodySmall, color: colors.ink.muted }}>Visited</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={{ ...typography.h2, color: colors.ink.rich }}>{content.profile.welcome}</Text>
                <Text style={{ ...typography.bodySmall, color: colors.ink.muted }}>{content.profile.signInPrompt}</Text>
                <Button
                  label="Sign In"
                  onPress={() => router.push("/(auth)/sign-in")}
                  size="compact"
                  style={{ marginTop: spacing.sm, alignSelf: "flex-start" as const }}
                />
              </>
            )}
          </View>
        </View>

        {/* ── Account (authenticated only) ── */}
        {isAuthenticated && (
          <View
            className="border-b"
            style={{ paddingVertical: spacing.md, borderBottomColor: colors.surface.divider }}
          >
            <SectionHeader title="Account" />
            <Card elevation="subtle" style={{ marginTop: spacing.xs }}>
              <View className="flex-row justify-end" style={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
                <Button label={content.profile.syncNow} variant="secondary" onPress={handleSyncNow} size="compact" />
                <Button label={content.profile.signOut} variant="secondary" onPress={handleSignOut} size="compact" />
              </View>
            </Card>
          </View>
        )}

        {/* ── Preferences ── */}
        <View
          className="border-b"
          style={{ paddingVertical: spacing.md, borderBottomColor: colors.surface.divider }}
        >
          <SectionHeader
            title={content.profile.preferencesSection}
            action={{ label: "Edit", onPress: handleRetakeQuiz }}
          />
          {!hasCompletedSetup ? (
            <View
              style={{
                backgroundColor: colors.sentiment.warningSubtle,
                padding: spacing.md,
                borderRadius: radius.sm,
                marginBottom: spacing.md,
              }}
            >
              <Text variant="bodySmall" color={colors.sentiment.warning}>
                {content.profile.incompleteWarning}
              </Text>
            </View>
          ) : null}
          <Card elevation="subtle" style={{ marginTop: spacing.xs }}>
            <PrefRow label={content.profile.skillLevel} value={validAbilities.length > 0 ? validAbilities.map((s) => SKILL_LABELS[s] ?? capitalize(s)).join(", ") : content.profile.notSet} onPress={handleRetakeQuiz} />
            <View style={{ height: 1, backgroundColor: colors.surface.divider, marginVertical: spacing.xs }} />
            <PrefRow label={content.profile.budget} value={budgetLevel ? capitalize(budgetLevel) + " " + content.profile.tier : content.profile.notSet} onPress={handleRetakeQuiz} />
            <View style={{ height: 1, backgroundColor: colors.surface.divider, marginVertical: spacing.xs }} />
            <PrefRow label={content.profile.regions} value={regions.length === 0 ? content.profile.notSet : regions.length >= 30 ? content.profile.allRegions : content.profile.regionsCount.replace("{count}", String(regions.length))} onPress={handleRetakeQuiz} />
            <View style={{ height: 1, backgroundColor: colors.surface.divider, marginVertical: spacing.xs }} />
            <PrefRow label={content.profile.visitedResorts} value={visitedIds.length === 0 ? content.profile.notSet : `${visitedIds.length} resort${visitedIds.length === 1 ? "" : "s"}`} />
          </Card>
        </View>

        {/* ── Actions ── */}
        <View
          className="border-b"
          style={{ paddingVertical: spacing.md, borderBottomColor: colors.surface.divider }}
        >
          <SectionHeader title={content.profile.actionsSection} />
          <Card elevation="subtle" padding="compact" style={{ marginTop: spacing.xs }}>
            <View style={{ gap: spacing.sm }}>
              <Button label={content.profile.retakeQuiz} variant="secondary" onPress={handleRetakeQuiz} fullWidth />
              {favoriteIds.length > 0 && (
                <Button
                  label={content.profile.clearSaved.replace("{count}", String(favoriteIds.length))}
                  variant="danger"
                  onPress={handleClearFavorites}
                  fullWidth
                />
              )}
            </View>
          </Card>
        </View>

        {/* ── Language ── */}
        <View
          className="border-b"
          style={{ paddingVertical: spacing.md, borderBottomColor: colors.surface.divider }}
        >
          <SectionHeader title={content.profile.languageSection} />
          <View className="flex-row" style={{ gap: spacing.sm }}>
            {(["en", "fr", "de"] as const).map((lang) => {
              const langLabel =
                lang === "en" ? content.languages.en : lang === "fr" ? content.languages.fr : content.languages.de;
              const isActive = language === lang;
              return (
                <Pressable
                  key={lang}
                  style={[
                    {
                      flex: 1,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: isActive ? colors.brand.primary : colors.border.default,
                      alignItems: "center" as const,
                      backgroundColor: isActive ? colors.brand.primary : undefined,
                    },
                  ]}
                  onPress={() => setLanguage(lang)}
                  accessibilityRole="button"
                  accessibilityLabel={langLabel}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text variant="bodySmall" style={isActive ? { color: colors.ink.onBrand } : undefined}>
                    {langLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── About ── */}
        <View style={{ paddingVertical: spacing.md }}>
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
      className="flex-row justify-between items-center"
      style={{ paddingVertical: spacing.sm }}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text variant="body">{label}</Text>
      <View className="flex-row items-center" style={{ gap: spacing.xs }}>
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

import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Head from "expo-router/head";
import * as Haptics from "expo-haptics";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { useQuizGuard } from "@hooks/useQuizGuard";
import { getResortCountsByCountry } from "@services/resort";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import {
  AnimatedQuizContent,
  StaggeredItem,
} from "@components/onboarding/AnimatedQuizContent";

/** Country with resort count */
interface CountryWithCount {
  id: string; // Country name as stored in DB (used as ID)
  name: string; // Localized display name
  flag: string; // Emoji flag
  resorts: number; // Number of resorts
}

/**
 * Flag display component.
 */
function FlagBadge({ flag, selected }: { flag: string; selected: boolean }) {
  return (
    <View
      style={[flagStyles.container, selected && flagStyles.containerActive]}
    >
      <Text style={flagStyles.flag}>{flag}</Text>
    </View>
  );
}

const flagStyles = {
  container: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.canvas.subtle,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  containerActive: {
    backgroundColor: colors.brand.primarySubtle,
  } as const,
  flag: { fontSize: 24 } as const,
};

/**
 * Animated country card with press feedback and luxury styling.
 */
function CountryCard({
  country,
  selected,
  onToggle,
  isTablet,
}: {
  country: CountryWithCount;
  selected: boolean;
  onToggle: () => void;
  isTablet: boolean;
}) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle();
  };

  return (
    <Pressable
      style={[
        styles.regionCard,
        selected && styles.regionCardActive,
        isTablet && styles.regionCardTablet,
      ]}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${country.name}, ${country.resorts} resorts`}
    >
      {/* Flag */}
      <FlagBadge flag={country.flag} selected={selected} />

      {/* Country info */}
      <View style={styles.regionInfo}>
        <Text
          variant="h4"
          color={selected ? colors.brand.primary : colors.ink.rich}
        >
          {country.name}
        </Text>
        <Text variant="caption" color={colors.ink.muted}>
          {country.resorts} resorts
        </Text>
      </View>

      {/* Selection indicator */}
      <View style={[styles.checkbox, selected && styles.checkboxActive]}>
        {selected && <Text style={styles.checkIcon}>✓</Text>}
      </View>
    </Pressable>
  );
}

export default function RegionScreen() {
  const isRedirecting = useQuizGuard();
  const { regions, setRegions } = usePreferencesStore();
  const { isTablet, hPadding, layoutMode: _layoutMode } = useLayout();
  const content = useContent();

  if (isRedirecting) return null;

  const [availableCountries, setAvailableCountries] = useState<
    CountryWithCount[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch countries with resort counts from Supabase
  useEffect(() => {
    async function loadCountries() {
      setLoading(true);
      setLoadError(false);
      try {
        const countsByCountry = await getResortCountsByCountry();

        // Build country list from DB data, using content.json for localized names/flags
        const countriesContent =
          (
            content as unknown as Record<
              string,
              Record<string, { name: string; flag: string }>
            >
          ).countries || {};
        const countries: CountryWithCount[] = Object.entries(countsByCountry)
          .filter(([_, count]) => count > 0)
          .map(([countryId, count]) => {
            const localized = countriesContent[countryId] || {
              name: countryId,
              flag: "🏔️",
            };
            return {
              id: countryId, // DB country name (e.g., "France")
              name: localized.name, // Localized display name
              flag: localized.flag, // Emoji flag
              resorts: count,
            };
          })
          .sort((a, b) => b.resorts - a.resorts); // Sort by resort count descending

        setAvailableCountries(countries);

        // Auto-select all countries on first load so new users start with "Anywhere in Europe"
        if (regions.length === 0) {
          setRegions(countries.map((c) => c.id));
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    loadCountries();
  }, [content, retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const allSelected =
    availableCountries.length > 0 &&
    regions.length === availableCountries.length;

  const toggle = (id: string) =>
    setRegions(
      regions.includes(id) ? regions.filter((r) => r !== id) : [...regions, id],
    );

  const handleSelectAll = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setRegions(allSelected ? [] : availableCountries.map((c) => c.id));
  };

  if (loading) {
    return (
      <QuizLayout scrollable>
        <View style={[styles.inner, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text
            variant="body"
            color={colors.ink.muted}
            style={{ marginTop: spacing.md }}
          >
            Loading countries...
          </Text>
        </View>
      </QuizLayout>
    );
  }

  if (loadError) {
    return (
      <QuizLayout scrollable>
        <View style={[styles.inner, styles.loadingContainer]}>
          <Text
            variant="h3"
            align="center"
            style={{ marginBottom: spacing.sm }}
          >
            Couldn't load regions
          </Text>
          <Text
            variant="body"
            color={colors.ink.muted}
            align="center"
            style={{ marginBottom: spacing.lg }}
          >
            Check your connection and try again.
          </Text>
          <Button
            label="Try Again"
            variant="secondary"
            onPress={() => setRetryCount((c) => c + 1)}
          />
        </View>
      </QuizLayout>
    );
  }

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <QuizLayout
        scrollable
        footer={
          <View style={styles.footer}>
            <Button
              label={`← ${content.onboarding.region.back}`}
              variant="ghost"
              onPress={() => router.push("/(onboarding)/budget")}
              style={styles.backBtn}
            />
            <Button
              label={`${content.onboarding.region.next} →`}
              onPress={() =>
                regions.length > 0 && router.push("/(onboarding)/vibes")
              }
              disabled={regions.length === 0}
              style={styles.nextBtn}
              size="prominent"
            />
          </View>
        }
      >
        <AnimatedQuizContent animation="parallax">
          <ScrollView
            style={styles.inner}
            contentContainerStyle={[
              styles.innerContent,
              // eslint-disable-next-line react-native/no-inline-styles
              { paddingHorizontal: isTablet ? 0 : hPadding },
            ]}
            showsVerticalScrollIndicator={Platform.OS !== "web"}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <ProgressIndicator current={4} total={5} showLabel />

            {/* Header */}
            <View style={styles.header}>
              <Text variant="h2">{content.onboarding.region.title}</Text>
              <Text variant="body" color={colors.ink.normal}>
                {content.onboarding.region.subtitle}
              </Text>
            </View>

            {/* Select all toggle */}
            <Pressable
              style={[styles.selectAll, allSelected && styles.selectAllActive]}
              onPress={handleSelectAll}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: allSelected }}
            >
              <View
                style={[
                  styles.selectAllCheck,
                  allSelected && styles.selectAllCheckActive,
                ]}
              >
                {allSelected ? (
                  <Text style={styles.selectAllCheckIcon}>✓</Text>
                ) : null}
              </View>
              <Text
                variant="bodyMedium"
                color={allSelected ? colors.brand.primary : colors.ink.normal}
              >
                {allSelected
                  ? content.onboarding.region.allSelected
                  : content.onboarding.region.selectAll}
              </Text>
            </Pressable>

            {/* Country grid — always 2 cols */}
            <View style={[styles.grid, isTablet && styles.gridTablet]}>
              {availableCountries.map((country, index) => (
                <StaggeredItem
                  key={country.id}
                  index={index}
                  baseDelay={60}
                  style={[styles.gridCell, isTablet && styles.gridCellTablet]}
                >
                  <CountryCard
                    country={country}
                    selected={regions.includes(country.id)}
                    onToggle={() => toggle(country.id)}
                    isTablet={isTablet}
                  />
                </StaggeredItem>
              ))}
            </View>
          </ScrollView>
        </AnimatedQuizContent>
      </QuizLayout>
    </>
  );
}

const styles = {
  inner: { flex: 1 } as const,
  innerContent: { paddingBottom: spacing.sm } as const,
  loadingContainer: { justifyContent: "center" as const, alignItems: "center" as const } as const,
  header: { marginBottom: spacing.md, gap: spacing.xs } as const,
  selectAll: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
    backgroundColor: colors.surface.primary,
    gap: spacing.sm,
    alignSelf: "flex-start" as const,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  selectAllActive: { borderColor: colors.brand.primary, backgroundColor: colors.brand.primarySubtle } as const,
  selectAllCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.surface.primary,
  },
  selectAllCheckActive: { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary } as const,
  selectAllCheckIcon: { color: colors.ink.onBrand, fontSize: 11, fontWeight: "700" as const } as const,
  grid: { gap: spacing.sm } as const,
  gridTablet: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.md } as const,
  gridCell: { flexGrow: 1 } as const,
  gridCellTablet: { width: "48%", minWidth: 140 } as const,
  regionCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.surface.primary,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    gap: spacing.sm,
  },
  regionCardTablet: { padding: spacing.md } as const,
  regionCardActive: { borderColor: colors.brand.primary, backgroundColor: colors.brand.primarySubtle } as const,
  regionInfo: { flex: 1, gap: 2 } as const,
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.surface.primary,
  },
  checkboxActive: { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary } as const,
  checkIcon: { color: colors.ink.onBrand, fontSize: 13, fontWeight: "700" as const } as const,
  footer: { flexDirection: "row" as const, gap: spacing.sm } as const,
  backBtn: { flex: 1 } as const,
  nextBtn: { flex: 2 } as const,
};

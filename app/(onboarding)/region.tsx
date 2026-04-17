import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Head from "expo-router/head";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { getResortCountsByCountry } from "@services/resort";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import { AnimatedQuizContent } from "@components/onboarding/AnimatedQuizContent";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

const flagStyles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.canvas.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  containerActive: {
    backgroundColor: colors.brand.primarySubtle,
  },
  flag: {
    fontSize: 24,
  },
});

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
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: interpolate(pressed.value, [0, 1], [0.08, 0.15]),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    pressed.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    pressed.value = withTiming(0, { duration: 200 });
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle();
  };

  return (
    <AnimatedPressable
      style={[
        styles.regionCard,
        selected && styles.regionCardActive,
        isTablet && styles.regionCardTablet,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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
    </AnimatedPressable>
  );
}

export default function RegionScreen() {
  const { regions, setRegions } = usePreferencesStore();
  const { isTablet, hPadding, layoutMode: _layoutMode } = useLayout();
  const content = useContent();

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
          <Text variant="h3" align="center" style={{ marginBottom: spacing.sm }}>
            Couldn't load regions
          </Text>
          <Text variant="body" color={colors.ink.muted} align="center" style={{ marginBottom: spacing.lg }}>
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
              onPress={() => router.back()}
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

            {/* Country grid — 2 cols on tablet */}
            <View style={[styles.grid, isTablet && styles.gridTablet]}>
              {availableCountries.map((country) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  selected={regions.includes(country.id)}
                  onToggle={() => toggle(country.id)}
                  isTablet={isTablet}
                />
              ))}
            </View>
          </ScrollView>
        </AnimatedQuizContent>
      </QuizLayout>
    </>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  innerContent: {
    paddingBottom: spacing.sm,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },

  // Select all
  selectAll: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
    backgroundColor: colors.surface.primary,
    gap: spacing.sm,
    alignSelf: "flex-start",
    // Shadow for consistency
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  selectAllActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySubtle,
  },
  selectAllCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.primary,
  },
  selectAllCheckActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  selectAllCheckIcon: {
    color: colors.ink.onBrand,
    fontSize: 11,
    fontWeight: "700",
  },

  // Grid
  grid: {
    gap: spacing.sm,
  },
  gridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: spacing.md,
  },

  // Region card
  regionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    gap: spacing.sm,
    // Multi-layer shadow (native)
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  regionCardTablet: {
    width: "47%",
    minWidth: 220,
    maxWidth: 280,
    padding: spacing.md,
  },
  regionCardActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySubtle,
    shadowOpacity: 0.15,
  },

  // Region info
  regionInfo: {
    flex: 1,
    gap: 2,
  },

  // Checkbox
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.primary,
  },
  checkboxActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
    // Subtle glow
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  checkIcon: {
    color: colors.ink.onBrand,
    fontSize: 13,
    fontWeight: "700",
  },

  // Footer
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});

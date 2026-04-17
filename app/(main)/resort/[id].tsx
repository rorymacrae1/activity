import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import Head from "expo-router/head";
import { View, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSequence,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import Heart from "lucide-react-native/dist/cjs/icons/heart";
import CheckCircle from "lucide-react-native/dist/cjs/icons/circle-check";
import XCircle from "lucide-react-native/dist/cjs/icons/circle-x";
import ChevronLeft from "lucide-react-native/dist/cjs/icons/chevron-left";
import { getResortSchema, getResortBreadcrumbs } from "@/utils/schema";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResortByIdAsync, getSimilarResorts } from "@services/resort";
import { useFavoritesStore } from "@stores/favorites";
import { useVisitedStore } from "@stores/visited";
import { useAuthStore } from "@stores/auth";
import { useDismissedStore } from "@stores/dismissed";
import {
  addVisitedResort,
  removeVisitedResort,
  hasVisitedResort,
} from "@services/profile";
import { useToast } from "@components/ui/Toast";
import { Icon } from "@components/ui/Icon";
import { ResortImage } from "@components/ui/ResortImage";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius, typography } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { EmptyState } from "@components/ui/EmptyState";
import { ErrorState } from "@components/ui/ErrorState";
import { LoadingState } from "@components/ui/LoadingState";
import { OverviewCarousel } from "@components/resort/OverviewCarousel";
import {
  ReviewsSection,
  AccommodationSection,
  TransportSection,
} from "@components/resort/PlaceholderSections";
import { MatchBreakdownSection } from "@components/resort/MatchBreakdownSection";
import { SimilarResortsCarousel } from "@components/resort/SimilarResortsCarousel";
import { LocationMapSection } from "@components/resort/LocationMapSection";
import { usePreferencesStore } from "@stores/preferences";
import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";
import {
  SKILL_LEVEL_MAP,
  BUDGET_LEVEL_MAP,
  DEFAULT_ABILITY,
} from "@/constants/options";
import { LOAD_TIMEOUT_MS } from "@/constants/scoring";

export default function ResortDetailScreen() {
  const { id, siblingIds: siblingIdsParam } = useLocalSearchParams<{
    id: string;
    siblingIds?: string;
  }>();
  const [resort, setResort] = useState<Resort | null>(null);
  const [similarResorts, setSimilarResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { setVisited } = useVisitedStore();
  const isVisited = useVisitedStore((s) => s.isVisited(id));
  const { user } = useAuthStore();
  const { dismiss } = useDismissedStore();
  const { showToast } = useToast();
  const { heroHeight, hPadding, isTablet, isDesktop } = useLayout();
  const content = useContent();

  // Compute NormalizedPreferences from store for the MatchBreakdownSection
  const groupAbilities = usePreferencesStore((s) => s.groupAbilities);
  const budgetLevel = usePreferencesStore((s) => s.budgetLevel);
  const regions = usePreferencesStore((s) => s.regions);
  const tripType = usePreferencesStore((s) => s.tripType);
  const crowdPreference = usePreferencesStore((s) => s.crowdPreference);
  const familyVsNightlife = usePreferencesStore((s) => s.familyVsNightlife);
  const snowImportance = usePreferencesStore((s) => s.snowImportance);

  const abilities =
    groupAbilities.length > 0 ? groupAbilities : ([DEFAULT_ABILITY] as const);
  const skillValues = abilities.map((s) => SKILL_LEVEL_MAP[s] ?? 0.33);
  const normalizedPrefs: NormalizedPreferences = {
    minSkill: Math.min(...skillValues),
    maxSkill: Math.max(...skillValues),
    tripType: tripType,
    budgetLevel: BUDGET_LEVEL_MAP[budgetLevel ?? "mid"] ?? 0.33,
    quietLively: (crowdPreference - 1) / 4,
    familyNightlife: (familyVsNightlife - 1) / 4,
    snowImportance: (snowImportance - 1) / 4,
    regions,
  };

  // Animation hooks — must be unconditional (Rules of Hooks)
  const heartScale = useSharedValue(1);
  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  // Scroll-reveal: nav title fades in after scrolling past the hero
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const navTitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [heroHeight - 80, heroHeight - 20],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  useEffect(() => {
    let cancelled = false;
    async function loadResort() {
      setLoading(true);
      setLoadError(false);

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS),
      );

      try {
        const data = await Promise.race([getResortByIdAsync(id), timeout]);
        if (cancelled) return;
        setResort(data ?? null);

        // Load visited status if logged in and update local cache
        if (data && user) {
          const visited = await hasVisitedResort(user.id, id);
          if (!cancelled) setVisited(id, visited);
        }

        // Load similar resorts: use passed IDs if available, otherwise compute
        if (data && !cancelled) {
          if (siblingIdsParam) {
            const ids = siblingIdsParam.split(",").filter(Boolean);
            const siblings = await Promise.all(
              ids.slice(0, 5).map((sibId) => getResortByIdAsync(sibId)),
            );
            if (!cancelled) setSimilarResorts(siblings.filter((r): r is Resort => r !== null));
          } else {
            const similar = await getSimilarResorts(id, 5);
            if (!cancelled) setSimilarResorts(similar);
          }
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadResort();
    return () => { cancelled = true; };
  }, [id, siblingIdsParam, user, retryCount]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading resort..." />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          message="Couldn't load this resort"
          detail="Check your connection and try again."
          onRetry={() => setRetryCount((c) => c + 1)}
        />
      </SafeAreaView>
    );
  }

  if (!resort) {
    return (
      <SafeAreaView style={styles.container}>
        <Head>
          <title>Resort Not Found | PisteWise</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <EmptyState
          icon="mountain"
          title={content.resort.notFoundTitle}
          message={content.resort.notFoundMessage}
          action={{
            label: content.resort.goBack,
            onPress: () => router.back(),
          }}
        />
      </SafeAreaView>
    );
  }

  const isSaved = isFavorite(resort.id);

  const handleToggleFavorite = () => {
    heartScale.value = withSequence(
      withSpring(1.4, { damping: 6, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );
    isSaved ? removeFavorite(resort.id) : addFavorite(resort.id);
  };

  const handleToggleVisited = async () => {
    if (!user) {
      router.push("/(auth)/sign-in");
      return;
    }
    const next = !isVisited;
    setVisited(resort.id, next); // Optimistic
    if (next) {
      const { error } = await addVisitedResort(user.id, resort.id);
      if (error) setVisited(resort.id, !next); // Rollback
    } else {
      const { error } = await removeVisitedResort(user.id, resort.id);
      if (error) setVisited(resort.id, !next); // Rollback
    }
  };

  const handleDismiss = () => {
    dismiss(resort.id);
    showToast({ type: "info", message: "Removed from recommendations" });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Head>
        <title>
          {resort.name} — Ski Resort in {resort.country} | PisteWise
        </title>
        <link
          rel="canonical"
          href={`https://pistewise.app/resort/${resort.id}`}
        />
        <meta
          name="description"
          content={`${resort.content.highlights[0]}. ${resort.attributes.snowReliability >= 4 ? "Excellent snow reliability." : ""} Located in ${resort.region}.`}
        />
        <meta property="og:title" content={`${resort.name} | PisteWise`} />
        <meta property="og:description" content={resort.content.description} />
        <meta property="og:image" content={resort.assets.heroImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={resort.name} />
        <meta
          name="twitter:description"
          content={resort.content.highlights[0]}
        />
        <meta name="twitter:image" content={resort.assets.heroImage} />
        <script type="application/ld+json">
          {JSON.stringify(getResortSchema(resort))}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(getResortBreadcrumbs(resort))}
        </script>
      </Head>

      {/* Fixed Navigation Bar */}
      <View style={styles.navBar}>
        <Pressable
          style={styles.navButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={20} strokeWidth={2} color={colors.ink.rich} />
        </Pressable>
        <Animated.Text style={[styles.navTitle, navTitleAnimatedStyle]} numberOfLines={1}>
          {resort.name}
        </Animated.Text>
        <View style={styles.navActions}>
          <Pressable
            style={styles.navButton}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Not for me — remove from recommendations"
          >
            <XCircle size={20} strokeWidth={1.75} color={colors.ink.muted} />
          </Pressable>
          <Pressable
            style={styles.navButton}
            onPress={handleToggleVisited}
            accessibilityRole="button"
            accessibilityLabel={
              isVisited ? "Remove from visited" : "Mark as visited"
            }
          >
            <CheckCircle
              size={20}
              strokeWidth={1.75}
              color={isVisited ? colors.sentiment.success : colors.ink.muted}
              fill={isVisited ? colors.sentiment.success : "none"}
            />
          </Pressable>
          <Pressable
            style={styles.navButton}
            onPress={handleToggleFavorite}
            accessibilityRole="button"
            accessibilityLabel={
              isSaved ? content.resort.unsave : content.resort.save
            }
          >
            <Animated.View style={heartAnimatedStyle}>
              <Heart
                size={20}
                strokeWidth={1.75}
                color={isSaved ? colors.brand.accent : colors.ink.muted}
                fill={isSaved ? colors.brand.accent : "none"}
              />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={Platform.OS !== "web"}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Full-bleed hero with gradient overlay */}
        <View style={[styles.heroContainer, { height: heroHeight }]}>
          <ResortImage
            uri={resort.assets.heroImage}
            style={styles.heroImage}
            accessibilityLabel={`${resort.name} ski resort`}
          />
          {/* Dark gradient for text legibility */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.72)"]}
            style={styles.heroGradient}
            pointerEvents="none"
          />
          {/* Resort identity overlay */}
          <View style={styles.heroOverlay} pointerEvents="none">
            <Text style={styles.heroName}>{resort.name}</Text>
            <Text style={styles.heroLocation}>
              {resort.region} · {resort.country}
            </Text>
            <View style={styles.heroStats}>
              <Text style={styles.heroStat}>{resort.stats.totalKm}km</Text>
              <Text style={styles.heroStatDot}> · </Text>
              <Text style={styles.heroStat}>
                {resort.location.villageAltitude}–{resort.location.peakAltitude}m
              </Text>
              <Text style={styles.heroStatDot}> · </Text>
              <Text style={styles.heroStat}>
                €{resort.attributes.averageDailyCost}/day
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={[styles.centeredContent, isTablet && styles.tabletCenter]}>
          {isDesktop ? (
            /* Desktop 2-col: left info, right match breakdown */
            <View style={styles.desktopRow}>
              {/* Left column */}
              <View style={styles.desktopLeft}>
                <View style={[styles.content, { paddingHorizontal: hPadding }]}>
                  <View style={styles.highlights}>
                    {resort.content.highlights.slice(0, 3).map((h, i) => (
                      <View key={i} style={styles.highlightChip}>
                        <Icon name="check" size={12} color={colors.sentiment.success} strokeWidth={2.5} />
                        <Text variant="caption" color={colors.sentiment.success} style={styles.highlightText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <OverviewCarousel resort={resort} />
                <View style={[styles.content, { paddingHorizontal: hPadding }]}>
                  {resort.content.description ? (
                    <Text variant="body" color={colors.ink.normal} style={styles.descriptionText}>
                      {resort.content.description}
                    </Text>
                  ) : null}
                  <ReviewsSection resort={resort} />
                  <AccommodationSection resort={resort} />
                  <TransportSection resort={resort} />
                  <LocationMapSection resort={resort} />
                  <Button
                    label={`🗺️  ${content.resort.viewMap}`}
                    onPress={() => router.push(`/(main)/map/${resort.id}`)}
                    fullWidth
                    style={styles.mapButton}
                  />
                </View>
              </View>
              {/* Right column: match breakdown */}
              <View style={[styles.desktopRight, { paddingHorizontal: hPadding }]}>
                <MatchBreakdownSection resort={resort} prefs={normalizedPrefs} />
              </View>
            </View>
          ) : (
            /* Phone / tablet: stacked layout */
            <>
              <View style={[styles.content, { paddingHorizontal: hPadding }]}>
                <View style={styles.highlights}>
                  {resort.content.highlights.slice(0, 3).map((h, i) => (
                    <View key={i} style={styles.highlightChip}>
                      <Icon name="check" size={12} color={colors.sentiment.success} strokeWidth={2.5} />
                      <Text variant="caption" color={colors.sentiment.success} style={styles.highlightText}>{h}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <OverviewCarousel resort={resort} />
              <View style={[styles.content, { paddingHorizontal: hPadding }]}>
                {resort.content.description ? (
                  <Text variant="body" color={colors.ink.normal} style={styles.descriptionText}>
                    {resort.content.description}
                  </Text>
                ) : null}
                <MatchBreakdownSection resort={resort} prefs={normalizedPrefs} />
                <ReviewsSection resort={resort} />
                <AccommodationSection resort={resort} />
                <TransportSection resort={resort} />
                <LocationMapSection resort={resort} />
                <Button
                  label={`🗺️  ${content.resort.viewMap}`}
                  onPress={() => router.push(`/(main)/map/${resort.id}`)}
                  fullWidth
                  style={styles.mapButton}
                />
              </View>
            </>
          )}

          {/* Similar Resorts Carousel - full width */}
          {similarResorts.length > 0 && (
            <SimilarResortsCarousel
              resorts={similarResorts}
              heading="Compare Against Similar Resorts"
              subheading="See how your other options stack up"
            />
          )}

          {/* Bottom spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas.default,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.canvas.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.divider,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    ...typography.h4,
    color: colors.ink.rich,
    marginHorizontal: spacing.sm,
  },
  tabletCenter: {
    maxWidth: 680,
    alignSelf: "center" as const,
    width: "100%",
  },
  desktopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  desktopLeft: {
    flex: 3,
    minWidth: 0,
  },
  desktopRight: {
    flex: 2,
    paddingTop: spacing.lg,
    borderLeftWidth: 1,
    borderLeftColor: colors.border.subtle,
    minWidth: 0,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.canvas.subtle,
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroName: {
    ...typography.h1,
    color: colors.ink.inverse,
    marginBottom: spacing.xxs,
  },
  heroLocation: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginBottom: spacing.sm,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroStat: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.ink.inverse,
  },
  heroStatDot: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  centeredContent: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  highlights: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  highlightChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.sentiment.successSubtle,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  highlightText: {
    fontWeight: "600" as const,
  },
  descriptionText: {
    marginBottom: spacing.lg,
  },
  mapButton: {
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});

import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import Head from "expo-router/head";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { Heart, CheckCircle } from "lucide-react-native";
import { getResortSchema, getResortBreadcrumbs } from "@/utils/schema";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResortByIdAsync, getSimilarResorts } from "@services/resort";
import { useFavoritesStore } from "@stores/favorites";
import { useAuthStore } from "@stores/auth";
import {
  addVisitedResort,
  removeVisitedResort,
  hasVisitedResort,
} from "@services/profile";
import { ResortImage } from "@components/ui/ResortImage";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Badge } from "@components/ui/Badge";
import { EmptyState } from "@components/ui/EmptyState";
import { LoadingState } from "@components/ui/LoadingState";
import { OverviewCarousel } from "@components/resort/OverviewCarousel";
import {
  ReviewsSection,
  AccommodationSection,
  TransportSection,
} from "@components/resort/PlaceholderSections";
import { SimilarResortsCarousel } from "@components/resort/SimilarResortsCarousel";
import type { Resort } from "@/types/resort";

export default function ResortDetailScreen() {
  const { id, siblingIds: siblingIdsParam } = useLocalSearchParams<{
    id: string;
    siblingIds?: string;
  }>();
  const [resort, setResort] = useState<Resort | null>(null);
  const [similarResorts, setSimilarResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisited, setIsVisited] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { user } = useAuthStore();
  const { heroHeight, hPadding, isTablet } = useLayout();
  const content = useContent();

  // Animation hook — must be unconditional (Rules of Hooks)
  const heartScale = useSharedValue(1);
  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  useEffect(() => {
    async function loadResort() {
      setLoading(true);
      const data = await getResortByIdAsync(id);
      setResort(data ?? null);

      // Load visited status if logged in
      if (data && user) {
        const visited = await hasVisitedResort(user.id, id);
        setIsVisited(visited);
      }

      // Load similar resorts: use passed IDs if available, otherwise compute
      if (data) {
        if (siblingIdsParam) {
          // Use IDs passed from results page
          const ids = siblingIdsParam.split(",").filter(Boolean);
          const siblings = await Promise.all(
            ids.slice(0, 5).map((sibId) => getResortByIdAsync(sibId)),
          );
          setSimilarResorts(siblings.filter((r): r is Resort => r !== null));
        } else {
          // Compute similar resorts based on attributes
          const similar = await getSimilarResorts(id, 5);
          setSimilarResorts(similar);
        }
      }

      setLoading(false);
    }
    loadResort();
  }, [id, siblingIdsParam]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading resort..." />
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
    setIsVisited(next);
    if (next) {
      const { error } = await addVisitedResort(user.id, resort.id);
      if (error) setIsVisited(false);
    } else {
      const { error } = await removeVisitedResort(user.id, resort.id);
      if (error) setIsVisited(true);
    }
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
          <Text style={styles.navButtonText}>←</Text>
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {resort.name}
        </Text>
        <View style={styles.navActions}>
          <Pressable
            style={styles.navButton}
            onPress={handleToggleVisited}
            accessibilityRole="button"
            accessibilityLabel={isVisited ? "Remove from visited" : "Mark as visited"}
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-bleed hero */}
        <View style={[styles.heroContainer, { height: heroHeight }]}>
          <ResortImage
            uri={resort.assets.heroImage}
            style={styles.heroImage}
            accessibilityLabel={`${resort.name} ski resort`}
          />
        </View>

        {/* Content */}
        <View style={[styles.centeredContent, isTablet && styles.tabletCenter]}>
          <View style={[styles.content, { paddingHorizontal: hPadding }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text variant="h1" style={styles.name}>
                  {resort.name}
                </Text>
                <Badge label={resort.country} variant="neutral" />
              </View>
              <Text variant="body" color={colors.text.secondary}>
                {resort.region} • {resort.location.villageAltitude}m –{" "}
                {resort.location.peakAltitude}m
              </Text>
            </View>

            {/* Highlights */}
            <View style={styles.highlights}>
              {resort.content.highlights.slice(0, 3).map((h, i) => (
                <View key={i} style={styles.highlightChip}>
                  <Text
                    variant="caption"
                    color={colors.success}
                    style={styles.highlightText}
                  >
                    ✓ {h}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Overview Carousel - full width */}
          <OverviewCarousel resort={resort} />

          {/* Remaining content with padding */}
          <View style={[styles.content, { paddingHorizontal: hPadding }]}>
            {/* Reviews Section */}
            <ReviewsSection resort={resort} />

            {/* Accommodation Section */}
            <AccommodationSection resort={resort} />

            {/* Transport Section */}
            <TransportSection resort={resort} />

            {/* Map CTA */}
            <Button
              label={`🗺️  ${content.resort.viewMap}`}
              onPress={() => router.push(`/(main)/map/${resort.id}`)}
              fullWidth
              style={styles.mapButton}
            />
          </View>

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
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
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
  navButtonText: {
    fontSize: 18,
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginHorizontal: spacing.sm,
  },
  tabletCenter: {
    maxWidth: 680,
    alignSelf: "center" as const,
    width: "100%",
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
    backgroundColor: colors.background.secondary,
  },
  centeredContent: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: {
    flex: 1,
  },
  highlights: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  highlightChip: {
    backgroundColor: colors.successSubtle,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  highlightText: {
    fontWeight: "600",
  },
  mapButton: {
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});

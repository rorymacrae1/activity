import { useLocalSearchParams, router } from "expo-router";
import Head from "expo-router/head";
import { View, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { getResortSchema, getResortBreadcrumbs } from "@/utils/schema";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResortById } from "@services/resort";
import { useFavoritesStore } from "@stores/favorites";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Badge } from "@components/ui/Badge";
import { Card } from "@components/ui/Card";
import { EmptyState } from "@components/ui/EmptyState";
import { TerrainChart } from "@components/resort/TerrainChart";
import { ResortInfoGrid } from "@components/resort/ResortInfoGrid";

export default function ResortDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resort = getResortById(id);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { heroHeight, hPadding, isTablet } = useLayout();
  const content = useContent();

  if (!resort) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="🏔️"
          title={content.resort.notFoundTitle}
          message={content.resort.notFoundMessage}
          action={{ label: content.resort.goBack, onPress: () => router.back() }}
        />
      </SafeAreaView>
    );
  }

  const isSaved = isFavorite(resort.id);
  const handleToggleFavorite = () =>
    isSaved ? removeFavorite(resort.id) : addFavorite(resort.id);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Head>
        <title>{resort.name} — Ski Resort in {resort.country} | PeakWise</title>
        <meta name="description" content={`${resort.content.highlights[0]}. ${resort.attributes.snowReliability >= 4 ? "Excellent snow reliability." : ""} Located in ${resort.region}.`} />
        <meta property="og:title" content={`${resort.name} | PeakWise`} />
        <meta property="og:description" content={resort.content.description} />
        <meta property="og:image" content={resort.assets.heroImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={resort.name} />
        <meta name="twitter:description" content={resort.content.highlights[0]} />
        <meta name="twitter:image" content={resort.assets.heroImage} />
        <script type="application/ld+json">{JSON.stringify(getResortSchema(resort))}</script>
        <script type="application/ld+json">{JSON.stringify(getResortBreadcrumbs(resort))}</script>
      </Head>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Full-bleed hero */}
        <View style={[styles.heroContainer, { height: heroHeight }]}>
          <Image
            source={{ uri: resort.assets.heroImage }}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel={`${resort.name} ski resort`}
          />
          <View style={styles.heroOverlay}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}
              accessibilityRole="button" accessibilityLabel="Go back">
              <Text style={styles.iconButtonText}>←</Text>
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleToggleFavorite}
              accessibilityRole="button" accessibilityLabel={isSaved ? content.resort.unsave : content.resort.save}>
              <Text style={styles.iconButtonText}>{isSaved ? "❤️" : "🤍"}</Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={[styles.centeredContent, isTablet && styles.tabletCenter]}>
          <View style={[styles.content, { paddingHorizontal: hPadding }]}>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text variant="h1" style={styles.name}>{resort.name}</Text>
                <Badge label={resort.country} variant="neutral" />
              </View>
              <Text variant="body" color={colors.text.secondary}>
                {resort.region} • {resort.location.villageAltitude}m – {resort.location.peakAltitude}m
              </Text>
            </View>

            {/* Highlights */}
            <View style={styles.highlights}>
              {resort.content.highlights.slice(0, 3).map((h, i) => (
                <View key={i} style={styles.highlightChip}>
                  <Text variant="caption" color={colors.success} style={styles.highlightText}>
                    ✓ {h}
                  </Text>
                </View>
              ))}
            </View>

            {/* ── At-a-Glance Info Grid ── */}
            <SectionBlock title={content.resort.infoTitle}>
              <ResortInfoGrid resort={resort} />
            </SectionBlock>

            {/* Terrain breakdown */}
            <SectionBlock title={content.resort.terrainTitle}>
              <TerrainChart terrain={resort.terrain} />
            </SectionBlock>

            {/* Overview */}
            <SectionBlock title={content.resort.overviewTitle}>
              <Text variant="body" color={colors.text.secondary} style={styles.description}>
                {resort.content.description}
              </Text>
            </SectionBlock>

            {/* Costs */}
            <SectionBlock title={content.resort.costsTitle}>
              <Card elevation="subtle">
                <CostRow label={content.resort.dayPass}     value={`€${resort.attributes.liftPassDayCost}`} />
                <View style={styles.divider} />
                <CostRow label={content.resort.sixDayPass}  value={`€${resort.attributes.liftPassSixDayCost}`} />
                <View style={styles.divider} />
                <CostRow label={content.resort.avgDaily}    value={`~€${resort.attributes.averageDailyCost}`} />
              </Card>
            </SectionBlock>

            {/* Map CTA */}
            <Button
              label={`🗺️  ${content.resort.viewMap}`}
              onPress={() => router.push(`/(main)/map/${resort.id}`)}
              fullWidth
              style={styles.mapButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="h3" style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.costRow}>
      <Text variant="body" color={colors.text.secondary}>{label}</Text>
      <Text variant="body" style={styles.costValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.background.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: {
    color: colors.text.inverse,
    fontSize: 20,
  },
  centeredContent: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  description: {
    lineHeight: 24,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  costValue: {
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.divider,
  },
  mapButton: {
    marginTop: spacing.md,
  },
});

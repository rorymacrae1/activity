import { useLocalSearchParams, router } from "expo-router";
import { View, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResortById } from "@/services/resort";
import { useFavoritesStore } from "@/stores/favorites";
import { useLayout } from "@/hooks/useLayout";
import { colors, spacing, radius } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TerrainChart } from "@/components/resort/TerrainChart";
import { ResortInfoGrid } from "@/components/resort/ResortInfoGrid";

export default function ResortDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resort = getResortById(id);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { heroHeight, hPadding, isTablet } = useLayout();

  if (!resort) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="🏔️"
          title="Resort not found"
          message="This resort doesn't exist or was removed."
          action={{ label: "Go Back", onPress: () => router.back() }}
        />
      </SafeAreaView>
    );
  }

  const isSaved = isFavorite(resort.id);
  const handleToggleFavorite = () =>
    isSaved ? removeFavorite(resort.id) : addFavorite(resort.id);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Full-bleed hero */}
        <View style={[styles.heroContainer, { height: heroHeight }]}>
          <Image
            source={{ uri: resort.assets.heroImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}
              accessibilityRole="button" accessibilityLabel="Go back">
              <Text style={styles.iconButtonText}>←</Text>
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleToggleFavorite}
              accessibilityRole="button" accessibilityLabel={isSaved ? "Remove from saved" : "Save resort"}>
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
            <SectionBlock title="Resort Info">
              <ResortInfoGrid resort={resort} />
            </SectionBlock>

            {/* Terrain breakdown */}
            <SectionBlock title="Terrain Breakdown">
              <TerrainChart terrain={resort.terrain} />
            </SectionBlock>

            {/* Overview */}
            <SectionBlock title="Overview">
              <Text variant="body" color={colors.text.secondary} style={styles.description}>
                {resort.content.description}
              </Text>
            </SectionBlock>

            {/* Costs */}
            <SectionBlock title="Lift Pass Costs">
              <Card elevation="sm">
                <CostRow label="Day Pass"        value={`€${resort.attributes.liftPassDayCost}`} />
                <View style={styles.divider} />
                <CostRow label="6-Day Pass"      value={`€${resort.attributes.liftPassSixDayCost}`} />
                <View style={styles.divider} />
                <CostRow label="Avg. Daily Cost" value={`~€${resort.attributes.averageDailyCost}`} />
              </Card>
            </SectionBlock>

            {/* Map CTA */}
            <Button
              label="🗺️  View Piste Map"
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

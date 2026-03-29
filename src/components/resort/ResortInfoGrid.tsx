import { View, StyleSheet } from "react-native";
import { Text } from "@components/ui/Text";
import { Badge } from "@components/ui/Badge";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius } from "@theme";
import type { Resort } from "@/types/resort";

interface ResortInfoGridProps {
  resort: Resort;
}

/**
 * At-a-glance info grid covering the 8 key resort facts:
 *  Snow sureness · Slope distance · Slope difficulty
 *  Transfer time · Town style · Family friendly
 *  Après-ski bars · Other activities
 */
export function ResortInfoGrid({ resort }: ResortInfoGridProps) {
  const { isTablet } = useLayout();
  const { attributes, stats, terrain } = resort;

  // Derived helpers
  const snowLabel = (n: number) =>
    n >= 5 ? "Excellent" : n >= 4 ? "Very good" : n >= 3 ? "Good" : n >= 2 ? "Fair" : "Variable";
  const snowVariant = (n: number): "success" | "primary" | "warning" | "error" =>
    n >= 4 ? "success" : n >= 3 ? "primary" : n >= 2 ? "warning" : "error";

  const familyLabel = (n: number) =>
    n >= 5 ? "Excellent" : n >= 4 ? "Great" : n >= 3 ? "Good" : n >= 2 ? "Limited" : "Not recommended";
  const familyVariant = (n: number): "success" | "primary" | "warning" | "error" =>
    n >= 4 ? "success" : n >= 3 ? "primary" : n >= 2 ? "warning" : "error";

  const transferHrs = Math.floor(attributes.transferTimeMinutes / 60);
  const transferMins = attributes.transferTimeMinutes % 60;
  const transferLabel = transferMins > 0 ? `${transferHrs}h ${transferMins}m` : `${transferHrs}h`;

  const dominantTerrain =
    terrain.beginner >= terrain.intermediate && terrain.beginner >= terrain.advanced
      ? "Beginner-friendly"
      : terrain.advanced >= terrain.intermediate
        ? "Expert-heavy"
        : "Intermediate focus";

  const cells = [
    {
      icon: "❄️",
      label: "Snow Sureness",
      primary: snowLabel(attributes.snowReliability),
      sub: `${attributes.snowReliability}/5 rating`,
      badge: { label: snowLabel(attributes.snowReliability), variant: snowVariant(attributes.snowReliability) } as const,
    },
    {
      icon: "⛷️",
      label: "Slope Distance",
      primary: `${stats.totalKm} km`,
      sub: `${stats.totalRuns} runs • ${stats.lifts} lifts`,
    },
    {
      icon: "🎿",
      label: "Slope Difficulty",
      primary: dominantTerrain,
      sub: `${terrain.beginner}% green · ${terrain.intermediate}% blue · ${terrain.advanced}% black`,
    },
    {
      icon: "✈️",
      label: "Transfer Time",
      primary: transferLabel,
      sub: `from ${attributes.nearestAirport}`,
    },
    {
      icon: "🏘️",
      label: "Town Style",
      primary: attributes.townStyle,
      sub: attributes.crowdLevel <= 2 ? "Quiet & uncrowded" : attributes.crowdLevel >= 4 ? "Busy & lively" : "Moderate crowds",
    },
    {
      icon: "👨‍👩‍👧",
      label: "Family Friendly",
      primary: familyLabel(attributes.familyScore),
      sub: `${attributes.familyScore}/5 family score`,
      badge: { label: familyLabel(attributes.familyScore), variant: familyVariant(attributes.familyScore) } as const,
    },
    {
      icon: "🍻",
      label: "Après-ski Bars",
      primary: `~${attributes.barCount} bars`,
      sub: attributes.nightlifeScore >= 4 ? "Excellent nightlife" : attributes.nightlifeScore >= 3 ? "Good nightlife" : "Relaxed evenings",
    },
    {
      icon: "🏔️",
      label: "Other Activities",
      primary: null,
      sub: null,
      activities: attributes.otherActivities,
    },
  ];

  return (
    <View style={[styles.grid, isTablet && styles.gridTablet]}>
      {cells.map((cell) => (
        <View key={cell.label} style={[styles.cell, isTablet && styles.cellTablet]}>
          <View style={styles.cellHeader}>
            <Text style={styles.cellIcon}>{cell.icon}</Text>
            <Text variant="captionMedium" color={colors.text.tertiary} style={styles.cellLabel}>
              {cell.label.toUpperCase()}
            </Text>
          </View>

          {cell.activities ? (
            <View style={styles.activitiesWrap}>
              {cell.activities.map((a) => (
                <View key={a} style={styles.activityChip}>
                  <Text variant="caption" color={colors.text.secondary}>{a}</Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              {cell.badge ? (
                <Badge label={cell.primary ?? ""} variant={cell.badge.variant} size="sm" />
              ) : (
                <Text variant="h4" style={styles.cellPrimary}>{cell.primary}</Text>
              )}
              {cell.sub ? (
                <Text variant="caption" color={colors.text.tertiary} style={styles.cellSub}>
                  {cell.sub}
                </Text>
              ) : null}
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gridTablet: {
    gap: spacing.md,
  },
  cell: {
    width: "48%",
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cellTablet: {
    // on tablet, show 3 per row
    width: "31%",
  },
  cellHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  cellIcon: {
    fontSize: 14,
  },
  cellLabel: {
    letterSpacing: 0.4,
  },
  cellPrimary: {
    color: colors.text.primary,
  },
  cellSub: {
    marginTop: 2,
  },
  activitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  activityChip: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

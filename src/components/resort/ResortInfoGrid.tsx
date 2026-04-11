import { View, StyleSheet } from "react-native";
import { Text } from "@components/ui/Text";
import { Badge } from "@components/ui/Badge";
import { Icon, type IconName } from "@components/ui/Icon";
import { useContent } from "@hooks/useContent";
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
  const content = useContent();
  const { attributes, stats, terrain } = resort;

  // Derived helpers — accept content so they work inside the component
  const snowLabel = (n: number) =>
    n >= 5
      ? content.infoGrid.snow.excellent
      : n >= 4
        ? content.infoGrid.snow.veryGood
        : n >= 3
          ? content.infoGrid.snow.good
          : n >= 2
            ? content.infoGrid.snow.fair
            : content.infoGrid.snow.variable;
  const snowVariant = (n: number): "success" | "brand" | "warning" | "error" =>
    n >= 4 ? "success" : n >= 3 ? "brand" : n >= 2 ? "warning" : "error";

  const familyLabel = (n: number) =>
    n >= 5
      ? content.infoGrid.family.excellent
      : n >= 4
        ? content.infoGrid.family.great
        : n >= 3
          ? content.infoGrid.family.good
          : n >= 2
            ? content.infoGrid.family.limited
            : content.infoGrid.family.notRecommended;
  const familyVariant = (
    n: number,
  ): "success" | "brand" | "warning" | "error" =>
    n >= 4 ? "success" : n >= 3 ? "brand" : n >= 2 ? "warning" : "error";

  const transferHrs = Math.floor(attributes.transferTimeMinutes / 60);
  const transferMins = attributes.transferTimeMinutes % 60;
  const transferLabel =
    transferMins > 0
      ? content.infoGrid.transferHoursMinutes
          .replace("{h}", String(transferHrs))
          .replace("{m}", String(transferMins))
      : content.infoGrid.transferHours.replace("{h}", String(transferHrs));

  const dominantTerrain =
    terrain.beginner >= terrain.intermediate &&
    terrain.beginner >= terrain.advanced
      ? content.infoGrid.beginner
      : terrain.advanced >= terrain.intermediate
        ? content.infoGrid.expert
        : content.infoGrid.intermediate;

  const cells: Array<{
    icon: IconName;
    label: string;
    primary?: string | null;
    sub?: string | null;
    badge?: {
      label: string;
      variant: "success" | "brand" | "warning" | "error";
    };
    activities?: string[];
  }> = [
    {
      icon: "snowflake",
      label: content.infoGrid.snowSureness,
      primary: snowLabel(attributes.snowReliability),
      sub: `${attributes.snowReliability}/5 rating`,
      badge: {
        label: snowLabel(attributes.snowReliability),
        variant: snowVariant(attributes.snowReliability),
      } as const,
    },
    {
      icon: "mountain",
      label: content.infoGrid.slopeDistance,
      primary: `${stats.totalKm} km`,
      sub:
        content.infoGrid.runs.replace("{runs}", String(stats.totalRuns)) +
        " • " +
        content.infoGrid.lifts.replace("{lifts}", String(stats.lifts)),
    },
    {
      icon: "activity",
      label: content.infoGrid.slopeDifficulty,
      primary: dominantTerrain,
      sub: `${terrain.beginner}% green · ${terrain.intermediate}% blue · ${terrain.advanced}% black`,
    },
    {
      icon: "plane",
      label: content.infoGrid.transferTime,
      primary: transferLabel,
      sub: content.infoGrid.from.replace(
        "{airport}",
        attributes.nearestAirport,
      ),
    },
    {
      icon: "map-pin",
      label: content.infoGrid.townStyle,
      primary: attributes.townStyle,
      sub:
        attributes.crowdLevel <= 2
          ? content.infoGrid.crowdQuiet
          : attributes.crowdLevel >= 4
            ? content.infoGrid.crowdBusy
            : content.infoGrid.crowdModerate,
    },
    {
      icon: "users-round",
      label: content.infoGrid.familyFriendly,
      primary: familyLabel(attributes.familyScore),
      sub: `${attributes.familyScore}/5 family score`,
      badge: {
        label: familyLabel(attributes.familyScore),
        variant: familyVariant(attributes.familyScore),
      } as const,
    },
    {
      icon: "wine",
      label: content.infoGrid.barsLabel,
      primary: content.infoGrid.barsCount.replace(
        "{count}",
        String(attributes.barCount),
      ),
      sub:
        attributes.nightlifeScore >= 4
          ? content.infoGrid.nightlifeHigh
          : attributes.nightlifeScore >= 3
            ? content.infoGrid.nightlifeMedium
            : content.infoGrid.nightlifeLow,
    },
    {
      icon: "compass",
      label: content.infoGrid.otherActivities,
      primary: null,
      sub: null,
      activities: attributes.otherActivities,
    },
  ];

  return (
    <View style={[styles.grid, isTablet && styles.gridTablet]}>
      {cells.map((cell) => (
        <View
          key={cell.label}
          style={[styles.cell, isTablet && styles.cellTablet]}
        >
          <View style={styles.cellHeader}>
            <Icon
              name={cell.icon}
              size={18}
              color={colors.brand.primary}
              strokeWidth={1.5}
            />
            <Text
              variant="captionMedium"
              color={colors.text.tertiary}
              style={styles.cellLabel}
            >
              {cell.label}
            </Text>
          </View>

          {cell.activities ? (
            <View style={styles.activitiesWrap}>
              {cell.activities.map((a) => (
                <View key={a} style={styles.activityChip}>
                  <Text variant="caption" color={colors.text.secondary}>
                    {a}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              {cell.badge ? (
                <Badge
                  label={cell.primary ?? ""}
                  variant={cell.badge.variant}
                  size="small"
                />
              ) : (
                <Text variant="h4" style={styles.cellPrimary}>
                  {cell.primary}
                </Text>
              )}
              {cell.sub ? (
                <Text
                  variant="caption"
                  color={colors.text.tertiary}
                  style={styles.cellSub}
                >
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
    borderColor: colors.border.default,
  },
});

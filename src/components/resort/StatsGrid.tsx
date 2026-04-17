import { View, StyleSheet } from "react-native";
import { Text } from "@components/ui/Text";
import { Icon, type IconName } from "@components/ui/Icon";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, typography } from "@theme";
import type { Resort } from "@/types/resort";

interface StatsGridProps {
  resort: Resort;
}

const STATS = (
  resort: Resort,
): { label: string; value: string; icon: IconName }[] => [
  {
    label: "Piste Length",
    value: `${resort.stats.totalKm}km`,
    icon: "mountain",
  },
  { label: "Runs", value: resort.stats.totalRuns.toString(), icon: "gauge" },
  { label: "Lifts", value: resort.stats.lifts.toString(), icon: "trending-up" },
  {
    label: "Peak",
    value: `${resort.location.peakAltitude}m`,
    icon: "trending-up",
  },
];

/**
 * Grid of key resort stats.
 * 4 columns on tablet, 2×2 on phone.
 */
export function StatsGrid({ resort }: StatsGridProps) {
  const { isTablet } = useLayout();
  const stats = STATS(resort);

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={[styles.statBox, isTablet && styles.statBoxTablet]}
        >
          <Icon
            name={stat.icon}
            size={22}
            color={colors.brand.primary}
            strokeWidth={1.5}
          />
          <Text style={[typography.stat, { color: colors.text.primary }]}>
            {stat.value}
          </Text>
          <Text style={[typography.statLabel, { color: colors.text.tertiary }]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  containerTablet: {
    flexWrap: "nowrap", // single row of 4 on tablet
  },
  statBox: {
    width: "48%",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
  },
  statBoxTablet: {
    flex: 1,
    width: undefined,
  },
});

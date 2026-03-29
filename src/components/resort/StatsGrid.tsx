import { View, StyleSheet } from "react-native";
import { Text } from "@components/ui/Text";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, typography } from "@theme";
import type { Resort } from "@/types/resort";

interface StatsGridProps {
  resort: Resort;
}

const STATS = (resort: Resort) => [
  { label: "Piste Length", value: `${resort.stats.totalKm}km`, icon: "⛷️" },
  { label: "Runs",         value: resort.stats.totalRuns.toString(),    icon: "🎿" },
  { label: "Lifts",        value: resort.stats.lifts.toString(),        icon: "🚡" },
  { label: "Peak",         value: `${resort.location.peakAltitude}m`,  icon: "🏔️" },
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
          <Text style={styles.icon}>{stat.icon}</Text>
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
  icon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
});

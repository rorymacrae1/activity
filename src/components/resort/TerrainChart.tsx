import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing } from "@/theme/spacing";
import type { TerrainDistribution } from "@/types/resort";

interface TerrainChartProps {
  terrain: TerrainDistribution;
}

/**
 * Visual chart showing terrain difficulty distribution.
 */
export function TerrainChart({ terrain }: TerrainChartProps) {
  return (
    <View style={styles.container}>
      {/* Beginner */}
      <View style={styles.row}>
        <View style={styles.label}>
          <View
            style={[styles.dot, { backgroundColor: colors.terrain.beginner }]}
          />
          <Text style={styles.labelText}>Beginner</Text>
        </View>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                width: `${terrain.beginner}%`,
                backgroundColor: colors.terrain.beginner,
              },
            ]}
          />
        </View>
        <Text style={styles.percentage}>{terrain.beginner}%</Text>
      </View>

      {/* Intermediate */}
      <View style={styles.row}>
        <View style={styles.label}>
          <View
            style={[
              styles.dot,
              { backgroundColor: colors.terrain.intermediate },
            ]}
          />
          <Text style={styles.labelText}>Intermediate</Text>
        </View>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                width: `${terrain.intermediate}%`,
                backgroundColor: colors.terrain.intermediate,
              },
            ]}
          />
        </View>
        <Text style={styles.percentage}>{terrain.intermediate}%</Text>
      </View>

      {/* Advanced */}
      <View style={styles.row}>
        <View style={styles.label}>
          <View
            style={[styles.dot, { backgroundColor: colors.terrain.advanced }]}
          />
          <Text style={styles.labelText}>Advanced</Text>
        </View>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                width: `${terrain.advanced}%`,
                backgroundColor: colors.terrain.advanced,
              },
            ]}
          />
        </View>
        <Text style={styles.percentage}>{terrain.advanced}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    width: 100,
    gap: spacing.xs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  labelText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 6,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 6,
  },
  percentage: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
});

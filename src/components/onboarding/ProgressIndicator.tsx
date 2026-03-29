import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

/**
 * Progress indicator for onboarding flow.
 * Shows current step out of total steps.
 */
export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < current ? styles.dotActive : styles.dotInactive,
            index === current - 1 && styles.dotCurrent,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 24,
    backgroundColor: colors.border,
  },
  dotCurrent: {
    width: 32,
  },
});

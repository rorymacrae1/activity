import { View, StyleSheet } from "react-native";
import { Text } from "@components/ui/Text";
import { colors, spacing } from "@theme";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  /** Show a "Step N of M" text label alongside the dots */
  showLabel?: boolean;
}

/**
 * Progress indicator for the onboarding quiz.
 * Pill-style dots — current step is wider and primary-coloured.
 */
export function ProgressIndicator({ current, total, showLabel = false }: ProgressIndicatorProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => {
          const done = i < current;
          const active = i === current - 1;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                done ? styles.dotDone : styles.dotFuture,
                active && styles.dotActive,
              ]}
            />
          );
        })}
      </View>
      {showLabel ? (
        <Text variant="captionMedium" color={colors.text.tertiary}>
          Step {current} of {total}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotDone: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotFuture: {
    width: 20,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 32,
    backgroundColor: colors.primary,
  },
});

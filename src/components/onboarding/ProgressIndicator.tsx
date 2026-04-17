import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Text } from "@components/ui/Text";
import { useContent } from "@hooks/useContent";
import { colors, spacing } from "@theme";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  /** Show a "Step N of M" text label alongside the dots */
  showLabel?: boolean;
}

/**
 * Single progress dot — springs to its target width on mount so the
 * active pill visibly "expands" when a new quiz step is reached.
 */
function AnimatedProgressDot({ done, active }: { done: boolean; active: boolean }) {
  const targetWidth = active ? 32 : done ? 24 : 20;
  // Active dot starts narrow and springs open; others start at their full width.
  const width = useSharedValue(active ? 6 : targetWidth);

  useEffect(() => {
    width.value = withSpring(targetWidth, { damping: 16, stiffness: 280 });
  }, [targetWidth, width]);

  const animatedStyle = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      style={[
        styles.dot,
        done || active ? styles.dotFilled : styles.dotFuture,
        animatedStyle,
      ]}
    />
  );
}

/**
 * Progress indicator for the onboarding quiz.
 * Pill-style dots — current step is wider and primary-coloured.
 * The active pill springs open on mount for a satisfying step-advance feel.
 */
export function ProgressIndicator({ current, total, showLabel = false }: ProgressIndicatorProps) {
  const content = useContent();
  return (
    <View style={styles.wrapper}>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <AnimatedProgressDot
            key={i}
            done={i < current}
            active={i === current - 1}
          />
        ))}
      </View>
      {showLabel ? (
        <Text variant="captionMedium" color={colors.ink.muted}>
          {content.progress.step
            .replace("{current}", String(current))
            .replace("{total}", String(total))}
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
  dotFilled: {
    backgroundColor: colors.brand.primary,
  },
  dotFuture: {
    backgroundColor: colors.border.default,
  },
});

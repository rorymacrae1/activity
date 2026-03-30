import { View, ActivityIndicator, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Text } from "./Text";
import { colors, spacing, animation } from "@theme";

interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /** Decorative icon (emoji) — will animate */
  icon?: string;
}

/**
 * Refined loading state with subtle animation.
 *
 * Features gentle icon pulse for visual interest without being distracting.
 *
 * @example
 * <LoadingState icon="🎿" message="Finding your perfect resorts..." />
 */
export function LoadingState({ message, icon }: LoadingStateProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Gentle breathing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1, // Infinite
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      {icon ? (
        <Animated.View style={animatedStyle}>
          <Text style={styles.icon}>{icon}</Text>
        </Animated.View>
      ) : null}
      <ActivityIndicator size="large" color={colors.brand.primary} />
      {message ? (
        <Text
          variant="body"
          color="muted"
          align="center"
          style={styles.message}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    padding: spacing["2xl"],
  },
  icon: {
    fontSize: 56,
  },
  message: {
    marginTop: spacing.sm,
    maxWidth: 240,
  },
});

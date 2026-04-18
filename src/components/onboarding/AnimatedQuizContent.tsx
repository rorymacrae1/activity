import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { View, StyleSheet } from "react-native";

/**
 * Animation preset types for quiz transitions
 */
export type QuizAnimation =
  | "crossfade" // 1. Airbnb-style: fade + lift
  | "staggered" // 2. Apple-style: elements animate in sequence
  | "softScale" // 3. Stripe-style: scale + fade
  | "parallax"; // 4. Editorial: slide with depth

interface AnimatedQuizContentProps {
  children: React.ReactNode;
  animation: QuizAnimation;
  /** Delay before animation starts (ms) */
  delay?: number;
}

// =============================================================================
// 1. CROSSFADE WITH LIFT (Airbnb-style)
// =============================================================================
function CrossfadeContent({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const progress = useSharedValue(0);

  useFocusEffect(
     
    useCallback(() => {
      progress.value = 0;
      progress.value = withDelay(
        delay,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
      );
    }, [delay, progress]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [20, 0]) }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// =============================================================================
// 2. STAGGERED REVEAL (Apple-style)
// =============================================================================
interface StaggeredProps {
  children: React.ReactNode;
  delay: number;
}

function StaggeredContent({ children, delay = 0 }: StaggeredProps) {
  const progress = useSharedValue(0);

  useFocusEffect(
     
    useCallback(() => {
      progress.value = 0;
      progress.value = withDelay(
        delay,
        withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
      );
    }, [delay, progress]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 0.5, 1], [30, 8, 0]) },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

/**
 * Wrap individual elements for staggered animation.
 * Use as child of AnimatedQuizContent with animation="staggered"
 */
export function StaggeredItem({
  children,
  index = 0,
  baseDelay = 60,
  style,
}: {
  children: React.ReactNode;
  index?: number;
  baseDelay?: number;
  style?: object;
}) {
  const progress = useSharedValue(0);

  useFocusEffect(
     
    useCallback(() => {
      progress.value = 0;
      progress.value = withDelay(
        index * baseDelay,
        withSpring(1, { damping: 20, stiffness: 300 }),
      );
    }, [index, baseDelay, progress]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [16, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.98, 1]) },
    ],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

// =============================================================================
// 3. SOFT SCALE (Stripe-style)
// =============================================================================
function SoftScaleContent({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const progress = useSharedValue(0);

  useFocusEffect(
     
    useCallback(() => {
      progress.value = 0;
      progress.value = withDelay(
        delay,
        withSpring(1, { damping: 18, stiffness: 200 }),
      );
    }, [delay, progress]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.96, 1]) }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// =============================================================================
// 4. PARALLAX SLIDE (Premium editorial)
// =============================================================================
function ParallaxContent({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const progress = useSharedValue(0);

  useFocusEffect(
     
    useCallback(() => {
      progress.value = 0;
      progress.value = withDelay(
        delay,
        withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }),
      );
    }, [delay, progress]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.6, 1]),
    transform: [{ translateX: interpolate(progress.value, [0, 1], [30, 0]) }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Animated wrapper for quiz content with multiple luxury animation presets.
 *
 * @example
 * <AnimatedQuizContent animation="staggered">
 *   <StaggeredItem index={0}><Title /></StaggeredItem>
 *   <StaggeredItem index={1}><Options /></StaggeredItem>
 * </AnimatedQuizContent>
 *
 * @example
 * <AnimatedQuizContent animation="crossfade">
 *   <QuizContent />
 * </AnimatedQuizContent>
 */
export function AnimatedQuizContent({
  children,
  animation,
  delay = 100,
}: AnimatedQuizContentProps) {
  switch (animation) {
    case "crossfade":
      return <CrossfadeContent delay={delay}>{children}</CrossfadeContent>;
    case "staggered":
      return <StaggeredContent delay={delay}>{children}</StaggeredContent>;
    case "softScale":
      return <SoftScaleContent delay={delay}>{children}</SoftScaleContent>;
    case "parallax":
      return <ParallaxContent delay={delay}>{children}</ParallaxContent>;
    default:
      return <View style={styles.container}>{children}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

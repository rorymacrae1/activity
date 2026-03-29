/**
 * Animation durations and easing for consistent motion.
 */
export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 400,
    enter: 300,
    exit: 200,
  },
  spring: {
    // Spring configs for react-native-reanimated withSpring
    snappy: { damping: 20, stiffness: 400 },
    default: { damping: 15, stiffness: 200 },
    gentle: { damping: 12, stiffness: 120 },
  },
} as const;

export type Animation = typeof animation;

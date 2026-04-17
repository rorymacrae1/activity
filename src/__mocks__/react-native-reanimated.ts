/**
 * Lightweight Reanimated mock for component tests.
 * Avoids native module initialization (react-native-worklets).
 */
import type React from "react";
import { View, ScrollView } from "react-native";

const noopSharedValue = (init: unknown) => ({ value: init });

const Animated = {
  View,
  ScrollView,
  createAnimatedComponent: (Component: React.ComponentType) => Component,
};

export default Animated;

// Hooks
export const useSharedValue = noopSharedValue;
export const useAnimatedStyle = (updater: () => object) => updater();
export const useDerivedValue = (updater: () => unknown) => ({
  value: updater(),
});
export const useAnimatedScrollHandler = () => ({});
export const withSpring = (value: number) => value;
export const withTiming = (value: number) => value;
export const withDelay = (_delay: number, animation: number) => animation;
export const withSequence = (...animations: number[]) =>
  animations[animations.length - 1];
export const interpolate = (
  value: number,
  inputRange: number[],
  outputRange: number[],
) => {
  if (inputRange.length < 2 || outputRange.length < 2) return outputRange[0];
  const ratio = (value - inputRange[0]!) / (inputRange[1]! - inputRange[0]!);
  return outputRange[0]! + ratio * (outputRange[1]! - outputRange[0]!);
};
export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  bezier: () => (t: number) => t,
  in: () => (t: number) => t,
  out: () => (t: number) => t,
  inOut: () => (t: number) => t,
};
export const runOnJS = (fn: (...args: unknown[]) => void) => fn;
export const runOnUI = (fn: (...args: unknown[]) => void) => fn;
export const cancelAnimation = () => {};
export const FadeIn = { duration: () => FadeIn };
export const FadeOut = { duration: () => FadeOut };
export const FadeInDown = {
  duration: () => FadeInDown,
  delay: () => FadeInDown,
};
export const SlideInRight = { duration: () => SlideInRight };
export const SlideOutLeft = { duration: () => SlideOutLeft };
export const Layout = { duration: () => Layout };

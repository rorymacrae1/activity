import type { ViewStyle } from "react-native";

/**
 * Shadow system — cross-platform (iOS shadow + Android elevation).
 */

type ShadowStyle = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

const makeShadow = (
  elevation: number,
  opacity: number,
  radius: number,
  offsetY: number
): ShadowStyle => ({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

export const shadows = {
  none: {} as ShadowStyle,
  sm: makeShadow(2, 0.06, 4, 1),
  md: makeShadow(4, 0.10, 8, 2),
  lg: makeShadow(8, 0.14, 16, 4),
  xl: makeShadow(12, 0.18, 24, 6),
} as const;

export type Shadows = typeof shadows;
export type ShadowVariant = keyof Shadows;

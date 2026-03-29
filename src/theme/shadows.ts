import { Platform, type ViewStyle } from "react-native";

/**
 * Shadow system — cross-platform (iOS shadow + Android elevation + web boxShadow).
 */

type ShadowStyle = Pick<
  ViewStyle,
  | "shadowColor"
  | "shadowOffset"
  | "shadowOpacity"
  | "shadowRadius"
  | "elevation"
> & { boxShadow?: string };

const makeShadow = (
  elevation: number,
  opacity: number,
  radius: number,
  offsetY: number,
): ShadowStyle => {
  // Web uses boxShadow; native uses shadow* props
  if (Platform.OS === "web") {
    const alpha = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0");
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

export const shadows = {
  none: {} as ShadowStyle,
  sm: makeShadow(2, 0.06, 4, 1),
  md: makeShadow(4, 0.1, 8, 2),
  lg: makeShadow(8, 0.14, 16, 4),
  xl: makeShadow(12, 0.18, 24, 6),
} as const;

export type Shadows = typeof shadows;
export type ShadowVariant = keyof Shadows;

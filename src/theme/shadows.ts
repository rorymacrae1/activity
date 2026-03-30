import { Platform, type ViewStyle } from "react-native";

/**
 * PeakWise Elevation System — Luxury Alpine
 *
 * Philosophy: Subtle, sophisticated depth. Not harsh drop shadows
 * but soft, diffused layers that suggest premium materials.
 *
 * Uses warm-tinted shadows (not pure black) for a softer feel.
 * Multiple shadow layers create realistic depth on web.
 */

type ShadowStyle = Pick<
  ViewStyle,
  | "shadowColor"
  | "shadowOffset"
  | "shadowOpacity"
  | "shadowRadius"
  | "elevation"
> & { boxShadow?: string };

// Warm shadow color (tinted, not pure black)
const SHADOW_COLOR = "#1C222C";
const SHADOW_RGB = "28, 34, 44";

/**
 * Creates layered shadows for realistic depth.
 * Web gets multi-layer CSS shadows; native uses single shadow + elevation.
 */
const makeShadow = (
  elevation: number,
  config: {
    ambient: { opacity: number; blur: number };
    key: { opacity: number; blur: number; y: number };
  },
): ShadowStyle => {
  if (Platform.OS === "web") {
    // Layered shadow: ambient (soft, all-around) + key (directional)
    const ambient = `0 0 ${config.ambient.blur}px rgba(${SHADOW_RGB}, ${config.ambient.opacity})`;
    const key = `0 ${config.key.y}px ${config.key.blur}px rgba(${SHADOW_RGB}, ${config.key.opacity})`;
    return { boxShadow: `${ambient}, ${key}` };
  }

  // Native: single shadow optimized for each platform
  return {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: config.key.y },
    shadowOpacity: config.key.opacity + config.ambient.opacity,
    shadowRadius: config.key.blur / 2,
    elevation,
  };
};

export const shadows = {
  /** No shadow */
  none: {} as ShadowStyle,

  /** Subtle lift — input fields, secondary cards */
  soft: makeShadow(1, {
    ambient: { opacity: 0.04, blur: 3 },
    key: { opacity: 0.03, blur: 2, y: 1 },
  }),

  /** Standard card elevation */
  card: makeShadow(3, {
    ambient: { opacity: 0.06, blur: 8 },
    key: { opacity: 0.04, blur: 6, y: 2 },
  }),

  /** Elevated elements — dropdowns, popovers */
  raised: makeShadow(6, {
    ambient: { opacity: 0.08, blur: 16 },
    key: { opacity: 0.06, blur: 12, y: 4 },
  }),

  /** High prominence — modals, hero cards */
  floating: makeShadow(12, {
    ambient: { opacity: 0.1, blur: 24 },
    key: { opacity: 0.08, blur: 20, y: 8 },
  }),

  /** Maximum elevation — full-screen overlays */
  overlay: makeShadow(24, {
    ambient: { opacity: 0.12, blur: 32 },
    key: { opacity: 0.1, blur: 28, y: 12 },
  }),

  // === Legacy aliases (for migration) ===
  /** @deprecated Use shadows.soft */
  sm: makeShadow(1, {
    ambient: { opacity: 0.04, blur: 3 },
    key: { opacity: 0.03, blur: 2, y: 1 },
  }),
  /** @deprecated Use shadows.card */
  md: makeShadow(3, {
    ambient: { opacity: 0.06, blur: 8 },
    key: { opacity: 0.04, blur: 6, y: 2 },
  }),
  /** @deprecated Use shadows.raised */
  lg: makeShadow(6, {
    ambient: { opacity: 0.08, blur: 16 },
    key: { opacity: 0.06, blur: 12, y: 4 },
  }),
  /** @deprecated Use shadows.floating */
  xl: makeShadow(12, {
    ambient: { opacity: 0.1, blur: 24 },
    key: { opacity: 0.08, blur: 20, y: 8 },
  }),
} as const;

export type Shadows = typeof shadows;
export type ShadowVariant = keyof Shadows;

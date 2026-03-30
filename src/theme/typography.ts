import type { TextStyle } from "react-native";

/**
 * PeakWise Typography System — Luxury Alpine
 *
 * Philosophy: Refined hierarchy with generous breathing room.
 * Headlines are confident but not shouty. Body copy is comfortable.
 *
 * Scale: 11 / 13 / 15 / 17 / 21 / 26 / 34 / 48 (near-golden ratio)
 * Line heights: 1.4–1.6× for readability
 *
 * Weight semantic naming:
 * - "light" (300) — elegant display text
 * - "regular" (400) — body copy
 * - "medium" (500) — emphasis, labels
 * - "semibold" (600) — subheadings
 * - "bold" (700) — headlines
 */

const base: TextStyle = {
  fontFamily: undefined, // System font (SF Pro / Roboto)
};

// === Scale Constants ===
const scale = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 21,
  xl: 26,
  "2xl": 34,
  "3xl": 48,
} as const;

export const typography = {
  // === Display — Hero moments ===
  displayLarge: {
    ...base,
    fontSize: scale["3xl"],
    fontWeight: "300", // Light for elegance
    lineHeight: 56,
    letterSpacing: -1.5,
  } as TextStyle,

  display: {
    ...base,
    fontSize: scale["2xl"],
    fontWeight: "300",
    lineHeight: 42,
    letterSpacing: -1,
  } as TextStyle,

  // === Headlines — Section anchors ===
  h1: {
    ...base,
    fontSize: scale.xl, // 26px
    fontWeight: "600",
    lineHeight: 34,
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    ...base,
    fontSize: scale.lg, // 21px
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    ...base,
    fontSize: scale.md, // 17px
    fontWeight: "600",
    lineHeight: 24,
    letterSpacing: -0.2,
  } as TextStyle,

  h4: {
    ...base,
    fontSize: scale.base, // 15px
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  // === Body — Long-form reading ===
  bodyLarge: {
    ...base,
    fontSize: scale.md, // 17px
    fontWeight: "400",
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,

  body: {
    ...base,
    fontSize: scale.base, // 15px
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  bodyMedium: {
    ...base,
    fontSize: scale.base,
    fontWeight: "500",
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  bodySmall: {
    ...base,
    fontSize: scale.sm, // 13px
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  bodySmallMedium: {
    ...base,
    fontSize: scale.sm,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  // === UI Elements ===
  button: {
    ...base,
    fontSize: scale.base, // 15px
    fontWeight: "500",
    lineHeight: 22,
    letterSpacing: 0.3, // Slight tracking for buttons
  } as TextStyle,

  buttonSmall: {
    ...base,
    fontSize: scale.sm, // 13px
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: 0.3,
  } as TextStyle,

  label: {
    ...base,
    fontSize: scale.sm, // 13px
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: 0.2,
  } as TextStyle,

  labelSmall: {
    ...base,
    fontSize: scale.xs, // 11px
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.3,
  } as TextStyle,

  // === Captions & Fine Print ===
  caption: {
    ...base,
    fontSize: scale.xs, // 11px
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.2,
  } as TextStyle,

  captionMedium: {
    ...base,
    fontSize: scale.xs,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.2,
  } as TextStyle,

  // === Eyebrow/Overline — Category labels ===
  overline: {
    ...base,
    fontSize: scale.xs, // 11px
    fontWeight: "600",
    lineHeight: 16,
    letterSpacing: 1.2, // Wide tracking
    textTransform: "uppercase",
  } as TextStyle,

  // === Monospace — Data/numbers ===
  mono: {
    fontFamily: "Menlo", // Falls back to system mono
    fontSize: scale.sm,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  // === Legacy / Data Display ===
  /** Large numbers in stats grids */
  stat: {
    ...base,
    fontSize: scale.xl, // 26px
    fontWeight: "600",
    lineHeight: 32,
    letterSpacing: -0.3,
  } as TextStyle,

  /** Labels under stat numbers */
  statLabel: {
    ...base,
    fontSize: scale.xs, // 11px
    fontWeight: "500",
    lineHeight: 14,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  } as TextStyle,

  /** Tab bar labels */
  tabLabel: {
    ...base,
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 14,
  } as TextStyle,
} as const;

export type Typography = typeof typography;
export type TypographyVariant = keyof Typography;

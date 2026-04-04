import type { TextStyle } from "react-native";
import { fontFamily } from "./fonts";

/**
 * PisteWise Typography System — Montserrat
 *
 * Philosophy: Refined hierarchy with generous breathing room.
 * Headlines are confident but not shouty. Body copy is comfortable.
 *
 * Font: Montserrat — geometric sans-serif with elegant proportions
 *
 * Scale: 11 / 13 / 15 / 17 / 21 / 26 / 34 / 48 (near-golden ratio)
 * Line heights: 1.4–1.6× for readability
 *
 * Weight allocation:
 * - Light (300) — elegant display text
 * - Regular (400) — body copy
 * - Medium (500) — buttons, labels
 * - SemiBold (600) — subheadings, emphasis
 * - Bold (700) — headlines
 */

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
    fontFamily: fontFamily.light,
    fontSize: scale["3xl"],
    lineHeight: 56,
    letterSpacing: -1.5,
  } as TextStyle,

  displayLargeItalic: {
    fontFamily: fontFamily.lightItalic,
    fontSize: scale["3xl"],
    lineHeight: 56,
    letterSpacing: -1.5,
  } as TextStyle,

  display: {
    fontFamily: fontFamily.light,
    fontSize: scale["2xl"],
    lineHeight: 42,
    letterSpacing: -1,
  } as TextStyle,

  displayItalic: {
    fontFamily: fontFamily.lightItalic,
    fontSize: scale["2xl"],
    lineHeight: 42,
    letterSpacing: -1,
  } as TextStyle,

  // === Headlines — Section anchors ===
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: scale.xl, // 26px
    lineHeight: 34,
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: scale.lg, // 21px
    lineHeight: 28,
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: scale.md, // 17px
    lineHeight: 24,
    letterSpacing: -0.2,
  } as TextStyle,

  h4: {
    fontFamily: fontFamily.semiBold,
    fontSize: scale.base, // 15px
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  // === Body — Long-form reading ===
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: scale.md, // 17px
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,

  bodyLargeItalic: {
    fontFamily: fontFamily.italic,
    fontSize: scale.md,
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,

  body: {
    fontFamily: fontFamily.regular,
    fontSize: scale.base, // 15px
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  bodyItalic: {
    fontFamily: fontFamily.italic,
    fontSize: scale.base,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: scale.base,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: scale.sm, // 13px
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  bodySmallItalic: {
    fontFamily: fontFamily.italic,
    fontSize: scale.sm,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  bodySmallMedium: {
    fontFamily: fontFamily.medium,
    fontSize: scale.sm,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  // === UI Elements ===
  button: {
    fontFamily: fontFamily.medium,
    fontSize: scale.base, // 15px
    lineHeight: 22,
    letterSpacing: 0.3,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fontFamily.medium,
    fontSize: scale.sm, // 13px
    lineHeight: 18,
    letterSpacing: 0.3,
  } as TextStyle,

  label: {
    fontFamily: fontFamily.medium,
    fontSize: scale.sm, // 13px
    lineHeight: 18,
    letterSpacing: 0.2,
  } as TextStyle,

  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: scale.xs, // 11px
    lineHeight: 16,
    letterSpacing: 0.3,
  } as TextStyle,

  // === Captions & Fine Print ===
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: scale.xs, // 11px
    lineHeight: 16,
    letterSpacing: 0.2,
  } as TextStyle,

  captionItalic: {
    fontFamily: fontFamily.italic,
    fontSize: scale.xs,
    lineHeight: 16,
    letterSpacing: 0.2,
  } as TextStyle,

  captionMedium: {
    fontFamily: fontFamily.medium,
    fontSize: scale.xs,
    lineHeight: 16,
    letterSpacing: 0.2,
  } as TextStyle,

  // === Eyebrow/Overline — Category labels ===
  overline: {
    fontFamily: fontFamily.semiBold,
    fontSize: scale.xs, // 11px
    lineHeight: 16,
    letterSpacing: 1.2, // Wide tracking
    textTransform: "uppercase",
  } as TextStyle,

  // === Monospace — Data/numbers ===
  mono: {
    fontFamily: "Menlo", // Falls back to system mono
    fontSize: scale.sm,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  // === Data Display ===
  /** Large numbers in stats grids */
  stat: {
    fontFamily: fontFamily.semiBold,
    fontSize: scale.xl, // 26px
    lineHeight: 32,
    letterSpacing: -0.3,
  } as TextStyle,

  /** Labels under stat numbers */
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: scale.xs, // 11px
    lineHeight: 14,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  } as TextStyle,

  /** Tab bar labels */
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.2,
  } as TextStyle,
} as const;

export type Typography = typeof typography;
export type TypographyKey = keyof Typography;

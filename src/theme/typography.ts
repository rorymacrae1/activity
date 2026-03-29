import type { TextStyle } from "react-native";

/**
 * Typography system for PeakWise.
 * Scale is based on a 4pt baseline grid.
 * All sizes use system font — no custom font loading needed.
 */

const base: TextStyle = {
  fontFamily: undefined, // Use system default (SF Pro / Roboto)
};

export const typography = {
  // === Display ===
  display: {
    ...base,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
    letterSpacing: -0.5,
  } as TextStyle,

  // === Headings ===
  h1: {
    ...base,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: -0.3,
  } as TextStyle,

  h2: {
    ...base,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.2,
  } as TextStyle,

  h3: {
    ...base,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  } as TextStyle,

  h4: {
    ...base,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  } as TextStyle,

  // === Body ===
  body: {
    ...base,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    ...base,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    ...base,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  } as TextStyle,

  bodySmallMedium: {
    ...base,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  } as TextStyle,

  // === UI ===
  button: {
    ...base,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0.1,
  } as TextStyle,

  buttonSmall: {
    ...base,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  } as TextStyle,

  label: {
    ...base,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  } as TextStyle,

  caption: {
    ...base,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  } as TextStyle,

  captionMedium: {
    ...base,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  } as TextStyle,

  // === Stats / Numbers ===
  stat: {
    ...base,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.3,
  } as TextStyle,

  statLabel: {
    ...base,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  } as TextStyle,

  tabLabel: {
    ...base,
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 14,
  } as TextStyle,
} as const;

export type Typography = typeof typography;
export type TypographyVariant = keyof Typography;

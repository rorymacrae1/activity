/**
 * PeakWise Design System — Luxury Alpine Color Palette
 *
 * Philosophy: High-end ski resort aesthetics — think Four Seasons
 * meets alpine minimalism. Muted sophistication, not tech-startup blue.
 *
 * Core Brand: Deep charcoal ("Alpine Night"), warm ivory ("Fresh Snow"),
 * muted sage ("Glacier"), and bronze accents ("Summit Gold").
 */

// === Primitive Palette ===
// These are internal — never use directly in components
const primitive = {
  // Alpine Night — primary dark (replaces generic navy)
  night: {
    950: "#0C0F14",
    900: "#141820",
    800: "#1C222C",
    700: "#262D3A",
    600: "#353E4F",
    500: "#4A5568",
  },

  // Fresh Snow — warm whites (not sterile pure white)
  snow: {
    50: "#FDFCFA",
    100: "#FAF9F7",
    200: "#F5F3F0",
    300: "#EBE8E4",
    400: "#D9D5CF",
    500: "#C4BFB8",
  },

  // Glacier — muted sage/teal accent
  glacier: {
    50: "#F4F9F8",
    100: "#E3F0EE",
    200: "#C7E0DC",
    300: "#9CC8C1",
    400: "#6BABA1",
    500: "#4E9085",
    600: "#3D756C",
    700: "#345D57",
    800: "#2D4B47",
    900: "#283E3B",
  },

  // Summit Gold — warm bronze accent for highlights
  gold: {
    50: "#FBF8F3",
    100: "#F5EDE0",
    200: "#EBD9BE",
    300: "#DFC193",
    400: "#D4A76D",
    500: "#C4894A",
    600: "#A66F3D",
    700: "#875735",
    800: "#6E4731",
    900: "#5C3C2B",
  },

  // Pure values
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // Semantic colors — desaturated for luxury feel
  emerald: {
    50: "#F0FAF5",
    100: "#D1F0E0",
    500: "#3B9D6E",
    600: "#2E7D57",
  },
  amber: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    500: "#C4894A", // Uses our gold
    600: "#A66F3D",
  },
  rose: {
    50: "#FFF5F5",
    100: "#FEE2E2",
    500: "#B85450",
    600: "#9B3D3A",
  },
} as const;

// === Semantic Tokens ===
// Brand-driven naming — what it IS, not what it looks like
export const colors = {
  // === Brand Identity ===
  brand: {
    primary: primitive.glacier[500],
    primaryMuted: primitive.glacier[400],
    primarySubtle: primitive.glacier[50],
    primaryStrong: primitive.glacier[700],
    accent: primitive.gold[500],
    accentMuted: primitive.gold[400],
    accentSubtle: primitive.gold[50],
  },

  // === Canvas (page backgrounds) ===
  canvas: {
    default: primitive.snow[50], // Warm off-white, not harsh
    subtle: primitive.snow[100],
    muted: primitive.snow[200],
    inset: primitive.snow[300], // For inset/sunken areas
    inverse: primitive.night[900],
  },

  // === Surface (cards, modals, elevated elements) ===
  surface: {
    primary: primitive.white,
    secondary: primitive.snow[100],
    tertiary: primitive.snow[200],
    elevated: primitive.white,
    overlay: "rgba(12, 15, 20, 0.7)",
    glass: "rgba(255, 255, 255, 0.85)",
    /** @deprecated Use colors.surface.primary */
    default: primitive.white,
    /** @deprecated Use colors.border.subtle */
    divider: primitive.snow[300],
  },

  // === Ink (text and icons) ===
  ink: {
    rich: primitive.night[900], // Primary text
    normal: primitive.night[700], // Secondary text
    muted: primitive.night[500], // Tertiary/placeholder
    faint: primitive.night[600], // Borders, subtle lines
    disabled: primitive.snow[400],
    inverse: primitive.snow[50],
    onBrand: primitive.white,
  },

  // === Border ===
  border: {
    subtle: primitive.snow[300],
    default: primitive.snow[400],
    strong: primitive.snow[500],
    focus: primitive.glacier[400],
    selected: primitive.glacier[500],
  },

  // === Interactive states ===
  interactive: {
    default: primitive.glacier[500],
    hover: primitive.glacier[600],
    active: primitive.glacier[700],
    disabled: primitive.snow[400],
    focus: primitive.glacier[400],
  },

  // === Sentiment (semantic feedback) ===
  sentiment: {
    success: primitive.emerald[500],
    successSubtle: primitive.emerald[50],
    successMuted: primitive.emerald[100],

    warning: primitive.amber[500],
    warningSubtle: primitive.amber[50],
    warningMuted: primitive.amber[100],

    error: primitive.rose[500],
    errorSubtle: primitive.rose[50],
    errorMuted: primitive.rose[100],

    info: primitive.glacier[500],
    infoSubtle: primitive.glacier[50],
    infoMuted: primitive.glacier[100],
  },

  // === Deprecated aliases (for migration) ===
  /** @deprecated Use colors.brand.primary */
  primary: primitive.glacier[500],
  /** @deprecated Use colors.brand.primarySubtle */
  primarySubtle: primitive.glacier[50],
  /** @deprecated Use colors.ink.rich */
  text: {
    primary: primitive.night[900],
    secondary: primitive.night[700],
    tertiary: primitive.night[500],
    disabled: primitive.snow[400],
    inverse: primitive.snow[50],
    link: primitive.glacier[500],
    onDark: primitive.snow[50],
  },
  /** @deprecated Use colors.canvas or colors.surface */
  background: {
    primary: primitive.snow[50],
    secondary: primitive.snow[100],
    tertiary: primitive.snow[200],
    elevated: primitive.white,
    overlay: "rgba(12, 15, 20, 0.7)",
  },
  /** @deprecated Use colors.sentiment */
  success: primitive.emerald[500],
  successSubtle: primitive.emerald[50],
  warning: primitive.amber[500],
  warningSubtle: primitive.amber[50],
  error: primitive.rose[500],
  errorSubtle: primitive.rose[50],
  info: primitive.glacier[500],
  infoSubtle: primitive.glacier[50],

  // === Terrain (piste colours) ===
  terrain: {
    beginner: primitive.emerald[500],
    intermediate: primitive.glacier[500],
    advanced: primitive.night[900],
    offPiste: primitive.gold[500],
  },

  // === Match score gradient ===
  match: {
    excellent: primitive.emerald[500], // 80-100%
    good: primitive.glacier[400], // 60-79%
    fair: primitive.gold[500], // 40-59%
    poor: primitive.rose[500], // 0-39%
  },
} as const;

export type Colors = typeof colors;

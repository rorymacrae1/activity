
/**
 * Color palette for PeakWise.
 * Mountain/alpine theme — deep navy, glacier blue, snow white.
 * Each semantic token maps to both light and dark values.
 */

const palette = {
  // Brand
  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue300: "#93c5fd",
  blue400: "#60a5fa",
  blue500: "#3b82f6",
  blue600: "#2563eb",
  blue700: "#1d4ed8",
  blue800: "#1e40af",
  blue900: "#1e3a8a",

  // Navy (dark UI surfaces)
  navy900: "#0a1628",
  navy800: "#0f2040",
  navy700: "#162b55",
  navy600: "#1e3a6e",

  // Neutrals
  white: "#ffffff",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",

  // Semantic
  green400: "#4ade80",
  green500: "#22c55e",
  green600: "#16a34a",
  amber400: "#fbbf24",
  amber500: "#f59e0b",
  amber600: "#d97706",
  red400: "#f87171",
  red500: "#ef4444",
  red600: "#dc2626",
} as const;

export const colors = {
  // === Brand ===
  primary: palette.blue600,
  primaryLight: palette.blue400,
  primaryDark: palette.blue700,
  primarySubtle: palette.blue50,

  // === Backgrounds ===
  background: {
    primary: palette.white,
    secondary: palette.slate50,
    tertiary: palette.slate100,
    elevated: palette.white, // Cards, modals
    overlay: "rgba(10,22,40,0.6)",
  },

  // === Surfaces (cards, inputs) ===
  surface: {
    default: palette.white,
    raised: palette.white,
    sunken: palette.slate50,
    border: palette.slate200,
    divider: palette.slate100,
  },

  // === Text ===
  text: {
    primary: palette.slate900,
    secondary: palette.slate600,
    tertiary: palette.slate400,
    disabled: palette.slate300,
    inverse: palette.white,
    link: palette.blue600,
    onDark: palette.white,
  },

  // === Semantic ===
  success: palette.green500,
  successLight: palette.green400,
  successSubtle: "#dcfce7",

  warning: palette.amber500,
  warningLight: palette.amber400,
  warningSubtle: "#fef3c7",

  error: palette.red500,
  errorLight: palette.red400,
  errorSubtle: "#fee2e2",

  info: palette.blue500,
  infoSubtle: palette.blue50,

  // === Border ===
  border: palette.slate200,
  borderFocus: palette.blue500,

  // === Terrain (piste colours) ===
  terrain: {
    beginner: palette.green500,
    intermediate: palette.blue500,
    advanced: palette.slate900,
    offPiste: palette.amber500,
  },

  // === Match score gradient ===
  match: {
    excellent: palette.green500, // 80-100%
    good: palette.blue400,       // 60-79%
    fair: palette.amber500,      // 40-59%
    poor: palette.red500,        // 0-39%
  },
} as const;

export type Colors = typeof colors;

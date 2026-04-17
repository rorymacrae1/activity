/**
 * PisteWise Design System — Alpine Luxe Color Palette
 *
 * Philosophy: Airbnb / Apple-level calmness meets alpine identity.
 * Sophisticated, premium, and restrained — not bright or playful.
 *
 * Foundation:
 *   Alpine Navy (#1E2A38) — primary brand, deep & confident
 *   Snow White (#F7F9FB) — soft background, not harsh
 *   Glacier Grey (#E5E7EB) — borders, dividers
 *   Charcoal (#1A1A1A) — primary text
 *   Mist Grey (#6B7280) — secondary text
 *
 * Ski Accents:
 *   Ice Blue (#D6EAF8) — card backgrounds, highlights
 *   Alpine Blue (#4A90A4) — subtle highlights, links
 *   Signal Red (#C23B3B) — CTA buttons (muted, not bright)
 */

// === Primitive Palette ===
// Internal use only — never reference directly in components
const primitive = {
  // Alpine Navy — primary brand color
  navy: {
    950: "#0D1117",
    900: "#1E2A38", // ← Primary
    800: "#2C3E50",
    700: "#3D5166",
    600: "#4E647C",
    500: "#607892",
  },

  // Snow — soft whites (warm, not sterile)
  snow: {
    50: "#F7F9FB", // ← Main background
    100: "#F1F4F8",
    200: "#E8ECF1",
    300: "#E5E7EB", // ← Glacier Grey (borders)
    400: "#D1D5DB",
    500: "#9CA3AF",
  },

  // Ice — blue tints for cards and highlights
  ice: {
    50: "#F0F7FC",
    100: "#D6EAF8", // ← Card backgrounds
    200: "#B8DAF2",
    300: "#8AC4EA",
    400: "#5AABDE",
    500: "#4A90A4", // ← Alpine Blue
    600: "#3D7A8C",
    700: "#326573",
    800: "#28505B",
    900: "#1F3D45",
  },

  // Charcoal — text greys
  ink: {
    900: "#1A1A1A", // ← Charcoal (primary text)
    800: "#2D2D2D",
    700: "#404040",
    600: "#525252",
    500: "#6B7280", // ← Mist Grey (secondary text)
    400: "#9CA3AF",
    300: "#D1D5DB",
  },

  // Signal — CTA and action colors (muted red)
  signal: {
    50: "#FEF5F5",
    100: "#FDE8E8",
    200: "#FBD0D0",
    300: "#F7A8A8",
    400: "#E56B6B",
    500: "#C23B3B", // ← Signal Red (CTA)
    600: "#A32E2E",
    700: "#862525",
    800: "#6B1F1F",
    900: "#581C1C",
  },

  // Pure values
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // Piste markers — authentic European ski signage
  piste: {
    green: "#22C55E",
    blue: "#3B82F6",
    red: "#EF4444",
    black: "#0F172A",
    pink: "#FBCFE8",
  },

  // Semantic feedback (desaturated for premium feel)
  emerald: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    500: "#22C55E",
    600: "#16A34A",
  },
  amber: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    500: "#F59E0B",
    600: "#D97706",
  },
  rose: {
    50: "#FFF1F2",
    100: "#FFE4E6",
    500: "#F43F5E",
    600: "#E11D48",
  },
} as const;

// === Semantic Tokens ===
// Brand-driven naming — reference by meaning, not appearance
export const colors = {
  // === Brand Identity ===
  brand: {
    primary: primitive.ice[500], // Alpine Blue
    primaryMuted: primitive.ice[400],
    primarySubtle: primitive.ice[100], // Ice Blue cards
    primaryStrong: primitive.ice[700],
    accent: primitive.signal[500], // Signal Red
    accentMuted: primitive.signal[400],
    accentSubtle: primitive.signal[50],
  },

  // === Canvas (page backgrounds) ===
  canvas: {
    default: primitive.snow[50], // Snow White
    subtle: primitive.snow[100],
    muted: primitive.snow[200],
    inset: primitive.snow[300], // Glacier Grey
    inverse: primitive.navy[900], // Alpine Navy
  },

  // === Surface (cards, modals, elevated elements) ===
  surface: {
    primary: primitive.white,
    secondary: primitive.snow[100],
    tertiary: primitive.ice[100], // Ice Blue for feature cards
    elevated: primitive.white,
    overlay: "rgba(30, 42, 56, 0.75)", // Navy overlay
    glass: "rgba(255, 255, 255, 0.9)",
    /** @deprecated Use colors.surface.primary */
    default: primitive.white,
    /** @deprecated Use colors.border.subtle */
    divider: primitive.snow[300],
  },

  // === Ink (text and icons) ===
  ink: {
    rich: primitive.ink[900], // Charcoal — primary text
    normal: primitive.ink[700], // Body text
    muted: primitive.ink[500], // Mist Grey — secondary
    faint: primitive.ink[400], // Placeholder, hints
    disabled: primitive.snow[500],
    inverse: primitive.snow[50],
    onBrand: primitive.white,
  },

  // === Border ===
  border: {
    subtle: primitive.snow[300], // Glacier Grey
    default: primitive.snow[400],
    strong: primitive.snow[500],
    focus: primitive.ice[500], // Alpine Blue focus ring
    selected: primitive.ice[500],
  },

  // === Interactive states ===
  interactive: {
    default: primitive.ice[500], // Alpine Blue
    hover: primitive.ice[600],
    active: primitive.ice[700],
    disabled: primitive.snow[400],
    focus: primitive.ice[400],
  },

  // === Sentiment (semantic feedback) ===
  sentiment: {
    success: primitive.emerald[500],
    successSubtle: primitive.emerald[50],
    successMuted: primitive.emerald[100],

    warning: primitive.amber[500],
    warningSubtle: primitive.amber[50],
    warningMuted: primitive.amber[100],

    error: primitive.signal[500], // Signal Red
    errorSubtle: primitive.signal[50],
    errorMuted: primitive.signal[100],

    info: primitive.ice[500],
    infoSubtle: primitive.ice[50],
    infoMuted: primitive.ice[100],
  },

  // === CTA (Call to Action) ===
  cta: {
    primary: primitive.signal[500], // Signal Red
    primaryHover: primitive.signal[600],
    primaryActive: primitive.signal[700],
    secondary: primitive.navy[900], // Alpine Navy
    secondaryHover: primitive.navy[800],
    secondaryActive: primitive.navy[700],
  },

  // === Deprecated aliases (for migration) ===
  /** @deprecated Use colors.brand.primary */
  primary: primitive.ice[500],
  /** @deprecated Use colors.brand.primarySubtle */
  primarySubtle: primitive.ice[100],
  /** @deprecated Use colors.ink.rich */
  text: {
    primary: primitive.ink[900],
    secondary: primitive.ink[700],
    tertiary: primitive.ink[500],
    disabled: primitive.snow[500],
    inverse: primitive.snow[50],
    link: primitive.ice[500],
    onDark: primitive.snow[50],
  },
  /** @deprecated Use colors.canvas or colors.surface */
  background: {
    primary: primitive.snow[50],
    secondary: primitive.snow[100],
    tertiary: primitive.snow[200],
    elevated: primitive.white,
    overlay: "rgba(30, 42, 56, 0.75)",
  },
  /** @deprecated Use colors.sentiment */
  success: primitive.emerald[500],
  successSubtle: primitive.emerald[50],
  warning: primitive.amber[500],
  warningSubtle: primitive.amber[50],
  error: primitive.signal[500],
  errorSubtle: primitive.signal[50],
  info: primitive.ice[500],
  infoSubtle: primitive.ice[50],

  // === Terrain (piste colours) — authentic ski markers ===
  terrain: {
    beginner: primitive.piste.green,
    intermediate: primitive.piste.blue,
    red: primitive.piste.red,
    advanced: primitive.piste.black,
    offPiste: primitive.ink[700],
  },

  // === Match score gradient ===
  match: {
    excellent: primitive.emerald[500], // 80-100%
    good: primitive.ice[500], // 60-79%
    fair: primitive.amber[500], // 40-59%
    poor: primitive.signal[500], // 0-39%
  },

  // === Rank (podium badges) ===
  rank: {
    gold: "#F59E0B", // amber-500
    silver: "#94A3B8", // slate-400
    bronze: "#C4793A", // warm bronze
  },

  // === On Dark (colors for use on dark backgrounds) ===
  onDark: {
    text: {
      primary: "rgba(255, 255, 255, 1)",
      secondary: "rgba(255, 255, 255, 0.9)",
      tertiary: "rgba(255, 255, 255, 0.7)",
      muted: "rgba(255, 255, 255, 0.6)",
    },
    surface: {
      subtle: "rgba(255, 255, 255, 0.1)",
      light: "rgba(255, 255, 255, 0.15)",
      medium: "rgba(255, 255, 255, 0.3)",
      glass: "rgba(255, 255, 255, 0.95)",
    },
    border: {
      subtle: "rgba(255, 255, 255, 0.1)",
      light: "rgba(255, 255, 255, 0.15)",
    },
    /** Semi-transparent black backdrop for modals/overlays on dark bg */
    backdrop: "rgba(0, 0, 0, 0.4)",
    /** Navy-tinted scrim for quiz/onboarding photo overlay */
    scrim: "rgba(10, 22, 40, 0.55)",
  },

  // === Utility ===
  transparent: "transparent",
  /** Platform shadow base colour — use with shadowOpacity */
  shadow: primitive.black,
} as const;

export type Colors = typeof colors;

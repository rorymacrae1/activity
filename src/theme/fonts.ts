/**
 * PisteWise Font Configuration
 *
 * Montserrat — A geometric sans-serif with elegant proportions
 * Perfect for a premium ski resort app with both readability and style.
 *
 * Weights loaded (trimmed to what's actually used in typography.ts):
 * - Light (300) + Italic — Display headings
 * - Regular (400) + Italic — Body text and body emphasis
 * - Medium (500) — Buttons, labels
 * - SemiBold (600) — Subheadings
 * - Bold (700) — Headlines
 *
 * Removed (unused): MediumItalic, SemiBoldItalic, BoldItalic (~1.8 MB web saving)
 */

import {
  Montserrat_300Light,
  Montserrat_300Light_Italic,
  Montserrat_400Regular,
  Montserrat_400Regular_Italic,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

/**
 * Font map for useFonts hook
 */
export const fontAssets = {
  "Montserrat-Light": Montserrat_300Light,
  "Montserrat-LightItalic": Montserrat_300Light_Italic,
  "Montserrat-Regular": Montserrat_400Regular,
  "Montserrat-Italic": Montserrat_400Regular_Italic,
  "Montserrat-Medium": Montserrat_500Medium,
  "Montserrat-SemiBold": Montserrat_600SemiBold,
  "Montserrat-Bold": Montserrat_700Bold,
};

/**
 * Font family names for use in styles
 */
export const fontFamily = {
  // Weight variants
  light: "Montserrat-Light",
  lightItalic: "Montserrat-LightItalic",
  regular: "Montserrat-Regular",
  italic: "Montserrat-Italic",
  medium: "Montserrat-Medium",
  semiBold: "Montserrat-SemiBold",
  bold: "Montserrat-Bold",

  // Semantic aliases
  body: "Montserrat-Regular",
  bodyEmphasis: "Montserrat-Italic",
  heading: "Montserrat-SemiBold",
  display: "Montserrat-Light",
  button: "Montserrat-Medium",
  label: "Montserrat-Medium",
} as const;

export type FontFamilyKey = keyof typeof fontFamily;

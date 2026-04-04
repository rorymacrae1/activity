/**
 * PisteWise Font Configuration
 *
 * Montserrat — A geometric sans-serif with elegant proportions
 * Perfect for a premium ski resort app with both readability and style.
 *
 * Weights loaded:
 * - Light (300) — Display headings
 * - Regular (400) — Body text
 * - Italic (400) — Emphasis
 * - Medium (500) — Buttons, labels
 * - Medium Italic (500)
 * - SemiBold (600) — Subheadings
 * - SemiBold Italic (600)
 * - Bold (700) — Headlines
 * - Bold Italic (700)
 */

import {
  Montserrat_300Light,
  Montserrat_300Light_Italic,
  Montserrat_400Regular,
  Montserrat_400Regular_Italic,
  Montserrat_500Medium,
  Montserrat_500Medium_Italic,
  Montserrat_600SemiBold,
  Montserrat_600SemiBold_Italic,
  Montserrat_700Bold,
  Montserrat_700Bold_Italic,
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
  "Montserrat-MediumItalic": Montserrat_500Medium_Italic,
  "Montserrat-SemiBold": Montserrat_600SemiBold,
  "Montserrat-SemiBoldItalic": Montserrat_600SemiBold_Italic,
  "Montserrat-Bold": Montserrat_700Bold,
  "Montserrat-BoldItalic": Montserrat_700Bold_Italic,
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
  mediumItalic: "Montserrat-MediumItalic",
  semiBold: "Montserrat-SemiBold",
  semiBoldItalic: "Montserrat-SemiBoldItalic",
  bold: "Montserrat-Bold",
  boldItalic: "Montserrat-BoldItalic",

  // Semantic aliases
  body: "Montserrat-Regular",
  bodyEmphasis: "Montserrat-Italic",
  heading: "Montserrat-SemiBold",
  display: "Montserrat-Light",
  button: "Montserrat-Medium",
  label: "Montserrat-Medium",
} as const;

export type FontFamilyKey = keyof typeof fontFamily;

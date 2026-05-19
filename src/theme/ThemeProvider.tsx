import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { colors as lightColors, type Colors } from "./colors";

/**
 * Dark mode palette — maps 1:1 to the light `colors` token structure.
 * Only semantic tokens are overridden; structural shape is identical.
 */
const darkColors: Colors = {
  ...lightColors,

  brand: {
    ...lightColors.brand,
    primarySubtle: "#1A2D3D",
  },

  canvas: {
    default: "#0D1117",
    subtle: "#161B22",
    muted: "#1C2128",
    inset: "#21262D",
    inverse: "#F7F9FB",
  },

  surface: {
    ...lightColors.surface,
    primary: "#161B22",
    secondary: "#1C2128",
    tertiary: "#1A2D3D",
    elevated: "#21262D",
    overlay: "rgba(0, 0, 0, 0.6)",
    glass: "rgba(22, 27, 34, 0.9)",
    default: "#161B22",
    divider: "#30363D",
  },

  ink: {
    rich: "#F0F6FC",
    normal: "#C9D1D9",
    muted: "#8B949E",
    faint: "#6E7681",
    disabled: "#484F58",
    inverse: "#0D1117",
    onBrand: "#FFFFFF",
  },

  border: {
    subtle: "#21262D",
    default: "#30363D",
    strong: "#484F58",
    focus: lightColors.brand.primary,
    selected: lightColors.brand.primary,
  },

  interactive: {
    ...lightColors.interactive,
    disabled: "#30363D",
  },

  sentiment: {
    ...lightColors.sentiment,
    successSubtle: "#0D2818",
    successMuted: "#14402A",
    warningSubtle: "#2D1F00",
    warningMuted: "#3D2A00",
    errorSubtle: "#2D0F0F",
    errorMuted: "#3D1515",
    infoSubtle: "#0D1F2D",
    infoMuted: "#152A3D",
  },

  text: {
    primary: "#F0F6FC",
    secondary: "#C9D1D9",
    tertiary: "#8B949E",
    disabled: "#484F58",
    inverse: "#0D1117",
    link: lightColors.brand.primary,
    onDark: "#F0F6FC",
  },

  background: {
    primary: "#0D1117",
    secondary: "#161B22",
    tertiary: "#1C2128",
    elevated: "#21262D",
    overlay: "rgba(0, 0, 0, 0.6)",
  },

  onDark: {
    text: {
      primary: "rgba(255, 255, 255, 1)",
      secondary: "rgba(255, 255, 255, 0.9)",
      tertiary: "rgba(255, 255, 255, 0.7)",
      muted: "rgba(255, 255, 255, 0.6)",
    },
    surface: {
      subtle: "rgba(255, 255, 255, 0.06)",
      light: "rgba(255, 255, 255, 0.1)",
      medium: "rgba(255, 255, 255, 0.2)",
      glass: "rgba(30, 42, 56, 0.95)",
    },
    border: {
      subtle: "rgba(255, 255, 255, 0.08)",
      light: "rgba(255, 255, 255, 0.12)",
    },
    backdrop: "rgba(0, 0, 0, 0.5)",
    scrim: "rgba(0, 0, 0, 0.55)",
  },

  shadow: "#000000",
} as unknown as Colors;

type ColorScheme = "light" | "dark";

interface ThemeContextValue {
  colors: Colors;
  colorScheme: ColorScheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  colorScheme: "light",
  isDark: false,
});

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Force a specific scheme (useful for testing / user preference override) */
  forcedScheme?: ColorScheme;
}

/**
 * Provides the active color palette based on system appearance.
 * Wrap the app root in this provider.
 *
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children, forcedScheme }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const colorScheme: ColorScheme =
    forcedScheme ?? (systemScheme === "dark" ? "dark" : "light");
  const isDark = colorScheme === "dark";

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      colorScheme,
      isDark,
    }),
    [colorScheme, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Access the current theme-aware color palette.
 * Falls back to light colors if used outside ThemeProvider.
 *
 * @example
 * const { colors, isDark } = useTheme();
 * <View style={{ backgroundColor: colors.canvas.default }} />
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Shortcut: returns just the active color tokens.
 */
export function useColors(): Colors {
  return useContext(ThemeContext).colors;
}

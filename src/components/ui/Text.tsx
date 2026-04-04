import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { typography, colors } from "@theme";
import type { TypographyKey } from "@theme";

/**
 * Text color presets — semantic naming
 */
type TextColor =
  | "rich"
  | "normal"
  | "muted"
  | "faint"
  | "inverse"
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "error";

const COLOR_MAP: Record<TextColor, string> = {
  rich: colors.ink.rich,
  normal: colors.ink.normal,
  muted: colors.ink.muted,
  faint: colors.ink.faint,
  inverse: colors.ink.inverse,
  brand: colors.brand.primary,
  accent: colors.brand.accent,
  success: colors.sentiment.success,
  warning: colors.sentiment.warning,
  error: colors.sentiment.error,
};

interface TextProps extends RNTextProps {
  /** Typography variant from the design system */
  variant?: TypographyKey;
  /** Semantic color preset (preferred) or custom color string */
  color?: TextColor | string;
  /** Text alignment */
  align?: "left" | "center" | "right";
}

/**
 * Design-system Text component with typography and color tokens.
 *
 * Features:
 * - Typography variants mapped to design system
 * - Semantic color presets for consistency
 * - Accessibility font scaling capped at 1.4×
 *
 * @example
 * // Heading with default color
 * <Text variant="h2">Find Your Resort</Text>
 *
 * // Body text with semantic color
 * <Text variant="bodySmall" color="muted">Austria • 200km</Text>
 *
 * // Display text with accent color
 * <Text variant="display" color="accent">Premium Experience</Text>
 */
export function Text({
  variant = "body",
  color = "rich",
  align,
  style,
  maxFontSizeMultiplier = 1.4,
  ...props
}: TextProps) {
  // Resolve color — check if it's a preset or custom value
  const resolvedColor =
    color in COLOR_MAP ? COLOR_MAP[color as TextColor] : color;

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        typography[variant],
        { color: resolvedColor },
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

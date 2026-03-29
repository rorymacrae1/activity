import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { typography, colors } from "@theme";
import type { TypographyVariant } from "@theme";

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: "left" | "center" | "right";
}

/**
 * Design-system Text component.
 * Wraps RN Text with typography tokens and clamps accessibility
 * font scaling to 1.4× to prevent layout overflow.
 *
 * @example
 * <Text variant="h2">Find Your Resort</Text>
 * <Text variant="bodySmall" color={colors.text.secondary}>Austria • 200km</Text>
 */
export function Text({
  variant = "body",
  color,
  align,
  style,
  maxFontSizeMultiplier = 1.4,
  ...props
}: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        typography[variant],
        { color: color ?? colors.text.primary },
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

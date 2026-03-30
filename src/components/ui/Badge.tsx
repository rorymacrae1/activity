import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors, spacing, radius, typography } from "@theme";

/**
 * Badge variants — semantic naming for luxury feel
 *
 * - neutral: Default, subtle background
 * - brand: Primary brand color
 * - accent: Gold accent for premium/featured
 * - success: Positive indicators
 * - warning: Caution indicators
 * - error: Negative/error indicators
 * - outlined: Minimal footprint with border only
 */
type BadgeVariant =
  | "neutral"
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "outlined";

/**
 * Badge sizes
 *
 * - small: Compact, inline use
 * - medium: Standard size
 */
type BadgeSize = "small" | "medium";

interface BadgeProps {
  /** Badge text */
  label: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size preset */
  size?: BadgeSize;
  /** Optional icon (emoji) */
  icon?: string;
}

const VARIANT_CONFIG: Record<
  BadgeVariant,
  { bg: string; text: string; border?: string }
> = {
  neutral: {
    bg: colors.canvas.muted,
    text: colors.ink.normal,
  },
  brand: {
    bg: colors.brand.primarySubtle,
    text: colors.brand.primaryStrong,
  },
  accent: {
    bg: colors.brand.accentSubtle,
    text: colors.brand.accent,
  },
  success: {
    bg: colors.sentiment.successSubtle,
    text: colors.sentiment.success,
  },
  warning: {
    bg: colors.sentiment.warningSubtle,
    text: colors.sentiment.warning,
  },
  error: {
    bg: colors.sentiment.errorSubtle,
    text: colors.sentiment.error,
  },
  outlined: {
    bg: "transparent",
    text: colors.ink.normal,
    border: colors.border.default,
  },
};

/**
 * Refined badge for status indicators, tags, and labels.
 *
 * @example
 * <Badge label="80% match" variant="success" />
 * <Badge label="Popular" variant="accent" icon="⭐" />
 * <Badge label="Advanced" variant="error" size="small" />
 */
export function Badge({
  label,
  variant = "neutral",
  size = "medium",
  icon,
}: BadgeProps) {
  const config = VARIANT_CONFIG[variant];
  const isSmall = size === "small";

  const borderStyle = config.border
    ? { borderWidth: 1, borderColor: config.border }
    : undefined;

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: config.bg },
        isSmall ? styles.small : styles.medium,
        borderStyle,
      ]}
      accessibilityLabel={label}
    >
      {icon ? (
        <Text style={[styles.icon, isSmall && styles.iconSmall]}>{icon}</Text>
      ) : null}
      <Text
        style={[
          isSmall ? typography.captionMedium : typography.label,
          { color: config.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.chip,
    alignSelf: "flex-start",
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing["2xs"],
    gap: spacing["2xs"],
  },
  medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  icon: {
    fontSize: 12,
  },
  iconSmall: {
    fontSize: 10,
  },
});

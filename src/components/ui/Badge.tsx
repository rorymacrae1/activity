import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors, spacing, radius, typography } from "@/theme";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral" | "primary";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success:  { bg: colors.successSubtle,  text: colors.success },
  warning:  { bg: colors.warningSubtle,  text: colors.warning },
  error:    { bg: colors.errorSubtle,    text: colors.error },
  info:     { bg: colors.infoSubtle,     text: colors.info },
  neutral:  { bg: colors.surface.sunken, text: colors.text.secondary },
  primary:  { bg: colors.primarySubtle,  text: colors.primary },
};

/**
 * Small label pill for status, tags, and match scores.
 *
 * @example
 * <Badge label="80% match" variant="success" />
 * <Badge label="Advanced" variant="error" />
 */
export function Badge({ label, variant = "neutral", size = "md" }: BadgeProps) {
  const { bg, text } = variantStyles[variant];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg },
        size === "sm" && styles.small,
      ]}
      accessibilityLabel={label}
    >
      <Text
        style={[
          size === "sm" ? typography.captionMedium : typography.bodySmallMedium,
          { color: text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  small: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
});

import { Pressable, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors, spacing, radius, typography } from "@/theme";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: string;
  disabled?: boolean;
}

/**
 * Selectable chip — used in onboarding for region/vibe multi-select.
 *
 * @example
 * <Chip label="France" selected={selected} onPress={toggle} leftIcon="🇫🇷" />
 */
export function Chip({ label, selected = false, onPress, leftIcon, disabled }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {leftIcon ? <Text style={styles.icon}>{leftIcon}</Text> : null}
      <Text
        style={[
          typography.bodySmallMedium,
          { color: selected ? colors.primary : colors.text.secondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignSelf: "flex-start",
  },
  selected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.surface.default,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 14,
  },
});

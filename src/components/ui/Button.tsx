import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import { colors, typography, spacing, radius } from "@theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  leftIcon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 36, md: 48, lg: 56 };
const H_PADDING: Record<ButtonSize, number> = { sm: spacing.md, md: spacing.xl, lg: spacing.xxl };

const BG: Record<ButtonVariant, string> = {
  primary: colors.primary,
  secondary: colors.background.tertiary,
  ghost: "rgba(0,0,0,0)",
  danger: colors.error,
};

const BORDER_COLOR: Record<ButtonVariant, string | undefined> = {
  primary: undefined,
  secondary: colors.border,
  ghost: undefined,
  danger: undefined,
};

const LABEL_COLOR: Record<ButtonVariant, string> = {
  primary: colors.text.inverse,
  secondary: colors.text.primary,
  ghost: colors.primary,
  danger: colors.text.inverse,
};

/**
 * Primary interactive element for PeakWise.
 *
 * @example
 * <Button label="Find My Resort" onPress={handlePress} />
 * <Button label="Save" variant="secondary" size="sm" />
 * <Button label="Loading..." loading />
 */
export function Button({
  variant = "primary",
  size = "md",
  label,
  loading = false,
  leftIcon,
  fullWidth = false,
  disabled,
  style: styleProp,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const spinnerColor = variant === "primary" || variant === "danger" ? colors.text.inverse : colors.primary;

  const borderStyle: ViewStyle = BORDER_COLOR[variant]
    ? { borderWidth: 1, borderColor: BORDER_COLOR[variant] }
    : {};

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: BG[variant], height: HEIGHT[size], paddingHorizontal: H_PADDING[size] },
        borderStyle,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        styleProp,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <Text style={styles.icon}>{leftIcon}</Text> : null}
          <Text
            style={[
              size === "sm" ? typography.buttonSmall : typography.button,
              { color: LABEL_COLOR[variant] },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  icon: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
});

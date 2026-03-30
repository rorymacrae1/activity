import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Platform,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text } from "./Text";
import {
  colors,
  typography,
  spacing,
  radius,
  animation,
  webStyles,
  interaction,
} from "@theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Button variants — opinionated, not generic
 *
 * - primary: Main CTA, uses brand glacier color
 * - secondary: Supporting actions, subtle border
 * - ghost: Text-only, minimal footprint
 * - accent: Premium gold accent for special actions
 * - muted: De-emphasized actions (cancel, dismiss)
 * - danger: Destructive actions
 */
type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "accent"
  | "muted"
  | "danger";

/**
 * Button sizes — named for intent
 *
 * - compact: Inline actions, tight spaces
 * - standard: Default for most actions
 * - prominent: Primary CTAs, hero sections
 */
type ButtonSize = "compact" | "standard" | "prominent";

interface ButtonProps extends Omit<PressableProps, "style"> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Button text */
  label: string;
  /** Show loading spinner */
  loading?: boolean;
  /** Emoji or icon character */
  leftIcon?: string;
  /** Stretch to fill container */
  fullWidth?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

// === Size Configuration ===
const SIZE_CONFIG: Record<
  ButtonSize,
  { height: number; paddingH: number; iconSize: number }
> = {
  compact: { height: 40, paddingH: spacing.lg, iconSize: 14 },
  standard: { height: 48, paddingH: spacing.xl, iconSize: 16 },
  prominent: { height: 56, paddingH: spacing["2xl"], iconSize: 18 },
};

// === Variant Colors ===
const VARIANT_CONFIG: Record<
  ButtonVariant,
  { bg: string; bgPressed: string; text: string; border?: string }
> = {
  primary: {
    bg: colors.brand.primary,
    bgPressed: colors.interactive.active,
    text: colors.ink.onBrand,
  },
  secondary: {
    bg: colors.surface.primary,
    bgPressed: colors.surface.secondary,
    text: colors.ink.rich,
    border: colors.border.default,
  },
  ghost: {
    bg: "transparent",
    bgPressed: colors.surface.secondary,
    text: colors.brand.primary,
  },
  accent: {
    bg: colors.brand.accent,
    bgPressed: colors.brand.accentMuted,
    text: colors.ink.rich,
  },
  muted: {
    bg: colors.canvas.muted,
    bgPressed: colors.canvas.inset,
    text: colors.ink.normal,
  },
  danger: {
    bg: colors.sentiment.error,
    bgPressed: colors.sentiment.error,
    text: colors.ink.onBrand,
  },
};

/**
 * Premium button component with animated press feedback.
 *
 * @example
 * <Button label="Find My Resort" onPress={handlePress} />
 * <Button label="Save" variant="secondary" size="compact" />
 * <Button label="Upgrade" variant="accent" size="prominent" />
 */
export function Button({
  variant = "primary",
  size = "standard",
  label,
  loading = false,
  leftIcon,
  fullWidth = false,
  disabled,
  style: styleProp,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const config = VARIANT_CONFIG[variant];
  const sizeConfig = SIZE_CONFIG[size];

  // Animation
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(
        interaction.scale.pressed,
        animation.spring.snappy,
      );
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.snappy);
  };

  const spinnerColor =
    variant === "primary" || variant === "danger" || variant === "accent"
      ? colors.ink.onBrand
      : colors.brand.primary;

  // Border style for secondary variant
  const borderStyle: ViewStyle = config.border
    ? { borderWidth: 1.5, borderColor: config.border }
    : {};

  return (
    <AnimatedPressable
      {...props}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          backgroundColor: config.bg,
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingH,
          borderRadius: radius.button,
        },
        borderStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        Platform.OS === "web" && styles.webInteractive,
        animatedStyle,
        styleProp,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? (
            <Text style={[styles.icon, { fontSize: sizeConfig.iconSize }]}>
              {leftIcon}
            </Text>
          ) : null}
          <Text
            style={[
              size === "compact" ? typography.buttonSmall : typography.button,
              { color: config.text },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
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
    gap: spacing.sm,
  },
  icon: {
    lineHeight: 20,
  },
  disabled: {
    opacity: interaction.opacity.disabled,
  },
  webInteractive: {
    ...webStyles.clickable,
    ...webStyles.interactive,
  },
});

import {
  ActivityIndicator,
  Pressable,
  Platform,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";
import { hapticLight } from "@lib/haptics";
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
 * - inverse: White outline for dark/photo backgrounds
 */
type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "accent"
  | "muted"
  | "danger"
  | "inverse";

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
  /** Lucide icon name (preferred over leftIcon) */
  icon?: IconName;
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
  inverse: {
    bg: "transparent",
    bgPressed: "rgba(255,255,255,0.15)",
    text: "#FFFFFF",
    border: "rgba(255,255,255,0.8)",
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
  icon,
  fullWidth = false,
  disabled,
  style: styleProp,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const config = VARIANT_CONFIG[variant];
  const sizeConfig = SIZE_CONFIG[size];
  const [isFocused, setIsFocused] = useState(false);

  // Animation
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      hapticLight();
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
    variant === "primary" || variant === "danger" || variant === "accent" || variant === "inverse"
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
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      // Static layout via NativeWind; dynamic bg/size/focus stay as style
      className={[
        fullWidth ? "self-stretch" : "self-start",
        Platform.OS === "web" ? "cursor-pointer select-none" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={[
        {
          backgroundColor: config.bg,
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingH,
          borderRadius: radius.button,
          alignItems: "center" as const,
          justifyContent: "center" as const,
          flexDirection: "row" as const,
        },
        borderStyle,
        isDisabled && { opacity: interaction.opacity.disabled },
        isFocused && Platform.OS === "web" && webStyles.focusVisible,
        animatedStyle,
        styleProp,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          {icon ? (
            <Icon name={icon} size={sizeConfig.iconSize} color={config.text} />
          ) : leftIcon ? (
            <Text style={[{ fontSize: sizeConfig.iconSize, lineHeight: 20 }]}>
              {leftIcon}
            </Text>
          ) : null}
          <Text
            style={[
              size === "compact" ? typography.buttonSmall : typography.button,
              { color: config.text, textAlign: "center" },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

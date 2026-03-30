import { Pressable, StyleSheet, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text } from "./Text";
import {
  colors,
  spacing,
  radius,
  typography,
  animation,
  interaction,
  webStyles,
} from "@theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Chip variants
 *
 * - filter: Multi-select filters (regions, vibes)
 * - choice: Single-select options
 * - input: Removable tags (future)
 */
type ChipVariant = "filter" | "choice" | "input";

interface ChipProps {
  /** Chip text */
  label: string;
  /** Selection state */
  selected?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Optional leading icon (emoji) */
  leftIcon?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Visual variant */
  variant?: ChipVariant;
}

/**
 * Premium selectable chip with smooth animations.
 *
 * Features:
 * - Animated press feedback
 * - Web hover states
 * - Refined selection styling
 *
 * @example
 * <Chip label="France" selected={selected} onPress={toggle} leftIcon="🇫🇷" />
 * <Chip label="Beginner-friendly" selected variant="filter" />
 */
export function Chip({
  label,
  selected = false,
  onPress,
  leftIcon,
  disabled,
  variant = "filter",
}: ChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(
        interaction.scale.pressed,
        animation.spring.snappy,
      );
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.snappy);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={label}
      style={[
        styles.base,
        selected ? styles.selected : styles.unselected,
        disabled && styles.disabled,
        Platform.OS === "web" && styles.webInteractive,
        animatedStyle,
      ]}
    >
      {leftIcon ? <Text style={styles.icon}>{leftIcon}</Text> : null}
      <Text
        style={[
          typography.label,
          { color: selected ? colors.brand.primaryStrong : colors.ink.normal },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.chip,
    borderWidth: 1.5,
    alignSelf: "flex-start",
  },
  selected: {
    backgroundColor: colors.brand.primarySubtle,
    borderColor: colors.brand.primary,
  },
  unselected: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.default,
  },
  disabled: {
    opacity: interaction.opacity.disabled,
  },
  icon: {
    fontSize: 14,
  },
  webInteractive: {
    ...webStyles.clickable,
    ...webStyles.interactive,
  },
});

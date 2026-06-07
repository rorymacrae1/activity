import { Pressable, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text } from "./Text";
import { hapticSelection } from "@lib/haptics";
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
  variant: _variant = "filter",
}: ChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      hapticSelection();
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
      className="flex-row items-center self-start"
      style={[
        {
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm + 2,
          borderRadius: radius.chip,
          borderWidth: 1.5,
          backgroundColor: selected ? colors.brand.primarySubtle : colors.surface.primary,
          borderColor: selected ? colors.brand.primary : colors.border.default,
        },
        disabled && { opacity: interaction.opacity.disabled },
        Platform.OS === "web" && webStyles.clickable,
        Platform.OS === "web" && webStyles.interactive,
        animatedStyle,
      ]}
    >
      {leftIcon ? <Text style={{ fontSize: 14 }}>{leftIcon}</Text> : null}
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

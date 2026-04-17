import {
  Pressable,
  View,
  StyleSheet,
  Platform,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  colors,
  radius,
  shadows,
  spacing,
  webStyles,
  animation,
  interaction,
} from "@theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Card elevation presets — semantic naming
 *
 * - flat: No shadow, subtle border (data tables, nested cards)
 * - subtle: Minimal lift (secondary content)
 * - standard: Default card elevation
 * - elevated: Prominent cards (featured content)
 * - floating: High prominence (modals, popovers)
 */
type CardElevation = "flat" | "subtle" | "standard" | "elevated" | "floating";

/**
 * Card padding presets
 *
 * - none: No padding (image cards, custom layouts)
 * - compact: Tight padding (dense lists)
 * - standard: Default padding
 * - spacious: Generous padding (featured cards)
 */
type CardPadding = "none" | "compact" | "standard" | "spacious";

interface CardProps {
  children: React.ReactNode;
  /** Shadow/elevation level */
  elevation?: CardElevation;
  /** Internal padding */
  padding?: CardPadding;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
  /** Press handler (makes card interactive) */
  onPress?: PressableProps["onPress"];
  /** Accessibility label for interactive cards */
  accessibilityLabel?: string;
  /** Show subtle border */
  bordered?: boolean;

  /** @deprecated Use padding="none" instead */
  noPadding?: boolean;
}

// === Elevation Mapping ===
const ELEVATION_MAP: Record<CardElevation, keyof typeof shadows> = {
  flat: "none",
  subtle: "soft",
  standard: "card",
  elevated: "raised",
  floating: "floating",
};

// === Padding Mapping ===
const PADDING_MAP: Record<CardPadding, number> = {
  none: 0,
  compact: spacing.md,
  standard: spacing.cardPadding,
  spacious: spacing.cardPaddingLarge,
};

/**
 * Premium card surface with sophisticated shadows and interactions.
 *
 * Features:
 * - Warm-tinted multi-layer shadows
 * - Smooth press animation
 * - Web hover effects
 * - Semantic elevation presets
 *
 * @example
 * // Standard card
 * <Card>
 *   <Text variant="h3">Resort Name</Text>
 * </Card>
 *
 * // Interactive elevated card
 * <Card elevation="elevated" onPress={handlePress}>
 *   <Text variant="h3">Featured Resort</Text>
 * </Card>
 *
 * // Image card with no padding
 * <Card padding="none" bordered>
 *   <Image source={...} />
 * </Card>
 */
export function Card({
  children,
  elevation = "standard",
  padding = "standard",
  style,
  onPress,
  accessibilityLabel,
  bordered = false,
  noPadding = false, // Legacy prop
}: CardProps) {
  const shadowStyle = shadows[ELEVATION_MAP[elevation]];
  const paddingValue = noPadding ? 0 : PADDING_MAP[padding];
  const scale = useSharedValue(1);
  const [isFocused, setIsFocused] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(
      interaction.scale.pressed,
      animation.spring.snappy,
    );
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.snappy);
  };

  const baseStyle: ViewStyle = {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.card,
    padding: paddingValue,
    ...(bordered && {
      borderWidth: 1,
      borderColor: colors.border.subtle,
    }),
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={[
          styles.base,
          baseStyle,
          shadowStyle,
          Platform.OS === "web" && styles.webInteractive,
          isFocused && Platform.OS === "web" && webStyles.focusVisible,
          animatedStyle,
          style,
        ]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[styles.base, baseStyle, shadowStyle, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  webInteractive: {
    ...webStyles.clickable,
    ...webStyles.hoverLift,
  },
});

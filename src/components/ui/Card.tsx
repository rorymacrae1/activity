import {
  Pressable,
  View,
  StyleSheet,
  Platform,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, radius, shadows, webStyles, animation } from "@theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardElevation = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  style?: StyleProp<ViewStyle>;
  onPress?: PressableProps["onPress"];
  accessibilityLabel?: string;
  noPadding?: boolean;
}

/**
 * Base card surface — white background, rounded corners, shadow.
 * Includes animated press feedback and web hover states.
 *
 * @example
 * <Card elevation="md" onPress={() => router.push(...)}>
 *   <Text variant="h3">{name}</Text>
 * </Card>
 */
export function Card({
  children,
  elevation = "md",
  style,
  onPress,
  accessibilityLabel,
  noPadding = false,
}: CardProps) {
  const shadowStyle = elevation === "none" ? {} : shadows[elevation];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.snappy);
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={[
          styles.base,
          shadowStyle,
          !noPadding && styles.padding,
          Platform.OS === "web" && styles.webInteractive,
          animatedStyle,
          style,
        ]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[styles.base, shadowStyle, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  padding: {
    padding: 16,
  },
  webInteractive: {
    ...webStyles.clickable,
    ...webStyles.interactive,
  },
});

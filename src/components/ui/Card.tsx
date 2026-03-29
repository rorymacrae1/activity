import {
  Pressable,
  View,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radius, shadows } from "@theme";

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
 * Use as a wrapper for resort cards, stat blocks, etc.
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

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.base,
          shadowStyle,
          !noPadding && styles.padding,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
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
  pressed: {
    opacity: 0.92,
  },
});

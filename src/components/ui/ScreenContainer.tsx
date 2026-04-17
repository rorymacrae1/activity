import { View, StyleSheet, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useLayout } from "@hooks/useLayout";
import { colors } from "@theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  /** SafeAreaView edges. Defaults to all edges. */
  edges?: Edge[];
  style?: ViewStyle;
  /** Override background colour */
  backgroundColor?: string;
  /** Disable the max-width centering (e.g., full-bleed hero screens) */
  noMaxWidth?: boolean;
}

/**
 * Drop-in replacement for SafeAreaView that:
 * - Caps content width at maxContentWidth on tablets (centered)
 * - Applies responsive horizontal padding
 * - Always fills the full screen height
 *
 * @example
 * <ScreenContainer>
 *   <Text variant="h1">Hello</Text>
 * </ScreenContainer>
 */
export function ScreenContainer({
  children,
  edges,
  style,
  backgroundColor = colors.canvas.default,
  noMaxWidth = false,
}: ScreenContainerProps) {
  const { contentMaxWidth, isTablet } = useLayout();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor }]}
      edges={edges}
    >
      {isTablet && !noMaxWidth ? (
        <View style={[styles.centerWrapper, { maxWidth: contentMaxWidth }]}>
          {children}
        </View>
      ) : (
        <View style={[styles.fill, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    alignItems: "stretch",
  },
  centerWrapper: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
  fill: {
    flex: 1,
  },
});

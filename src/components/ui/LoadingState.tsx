import { View, Image, StyleSheet } from "react-native";
import { Text } from "./Text";
import { spacing } from "@theme";

// Yeti loading GIF
const LOADING_YETI = require("../../../assets/LoadingYeti.gif");

interface LoadingStateProps {
  /** Loading message */
  message?: string;
}

/**
 * Loading state with animated yeti.
 *
 * @example
 * <LoadingState message="Finding your perfect resorts..." />
 */
export function LoadingState({ message }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <Image source={LOADING_YETI} style={styles.yeti} />
      {message ? (
        <Text
          variant="body"
          color="muted"
          align="center"
          style={styles.message}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing["2xl"],
  },
  yeti: {
    width: 120,
    height: 120,
  },
  message: {
    marginTop: spacing.xs,
    maxWidth: 240,
  },
});

import { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Text } from "./Text";
import { spacing } from "@theme";
import { SLOW_LOAD_THRESHOLD_MS } from "@/constants/scoring";

// Yeti loading GIF
const LOADING_YETI = require("../../../assets/LoadingYeti.gif");

interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /**
   * After this many ms, show a slow-load sub-message.
   * Defaults to SLOW_LOAD_THRESHOLD_MS (5s). Pass 0 to disable.
   */
  slowThreshold?: number;
}

/**
 * Loading state with animated yeti.
 * After slowThreshold ms, adds a reassurance message so users know it hasn't frozen.
 *
 * @example
 * <LoadingState message="Finding your perfect resorts..." />
 */
export function LoadingState({
  message,
  slowThreshold = SLOW_LOAD_THRESHOLD_MS,
}: LoadingStateProps) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!slowThreshold) return;
    const t = setTimeout(() => setIsSlow(true), slowThreshold);
    return () => clearTimeout(t);
  }, [slowThreshold]);

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
      {isSlow ? (
        <Text variant="bodySmall" color="muted" align="center" style={styles.slowMessage}>
          Taking longer than expected… still working on it
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
  slowMessage: {
    maxWidth: 260,
    marginTop: -spacing.sm,
  },
});

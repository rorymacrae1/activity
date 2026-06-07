import { useEffect, useState } from "react";
import { View, Image } from "react-native";
import { Text } from "./Text";
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
    <View className="flex-1 items-center justify-center gap-4 p-8">
      <Image source={LOADING_YETI} style={{ width: 120, height: 120 }} />
      {message ? (
        <Text
          variant="body"
          color="muted"
          align="center"
          className="mt-1 max-w-[240px]"
        >
          {message}
        </Text>
      ) : null}
      {isSlow ? (
        <Text variant="bodySmall" color="muted" align="center" className="max-w-[260px] -mt-2">
          Taking longer than expected… still working on it
        </Text>
      ) : null}
    </View>
  );
}

/**
 * ResortImage
 *
 * A thin wrapper around expo-image that applies consistent settings
 * across all resort hero images in the app:
 *
 * - contentFit="cover" — always fills the container without distortion
 * - transition — 200ms cross-fade so images don't snap in abruptly
 * - placeholder — a soft alpine-blue shimmer while the real image loads
 * - cachePolicy="memory-disk" — fast repeat loads in the same session
 *
 * Usage:
 *   <ResortImage
 *     uri={resort.assets.heroImage}
 *     style={{ width: "100%", height: 260 }}
 *     accessibilityLabel={`${resort.name} ski resort`}
 *   />
 */

import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import type { ImageStyle } from "expo-image";
import type { StyleProp } from "react-native";
import { useState } from "react";
import { colors } from "@/theme/colors";

// Local fallback used when no URI is provided or the remote image fails.
const DEFAULT_RESORT_IMAGE = require("../../../assets/images/default-resort.jpg");

/**
 * Blurhash placeholder — a 32×32 alpine-blue gradient encoded as a Blurhash
 * string. Generated from a representative ski-slope photo.
 * Displays as a soft blue-grey shimmer while the real image loads.
 */
const ALPINE_BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface ResortImageProps {
  /** Remote URI for the resort hero photo. Falls back to local asset if falsy. */
  uri?: string;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  /** resizeMode alias — defaults to "cover" */
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export function ResortImage({
  uri,
  style,
  accessibilityLabel,
  contentFit = "cover",
}: ResortImageProps) {
  const [useFallback, setUseFallback] = useState(false);

  return (
    <Image
      source={uri && !useFallback ? { uri } : DEFAULT_RESORT_IMAGE}
      placeholder={{ blurhash: ALPINE_BLURHASH }}
      contentFit={contentFit}
      transition={200}
      cachePolicy="memory-disk"
      style={[styles.base, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      onError={() => setUseFallback(true)}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.canvas.inverse,
  },
});

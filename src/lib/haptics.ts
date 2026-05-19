/**
 * Centralized haptic feedback utility.
 * No-ops gracefully on web where expo-haptics is not available.
 */

import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const isNative = Platform.OS !== "web";

/**
 * Light tap — quiz selections, chip toggles, tab switches.
 */
export function hapticLight(): void {
  if (isNative) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

/**
 * Medium tap — favorite toggle, visited toggle, dismiss.
 */
export function hapticMedium(): void {
  if (isNative) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

/**
 * Success feedback — onboarding complete, profile saved.
 */
export function hapticSuccess(): void {
  if (isNative) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

/**
 * Selection changed — slider adjustments, segmented control.
 */
export function hapticSelection(): void {
  if (isNative) {
    Haptics.selectionAsync();
  }
}

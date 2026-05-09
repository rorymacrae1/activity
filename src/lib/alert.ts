/**
 * Cross-platform alert dialog.
 *
 * Uses `Alert.alert()` on iOS/Android and `window.confirm()` on web,
 * since React Native's `Alert` is not available in the browser.
 */

import { Alert, Platform } from "react-native";

interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

/**
 * Show a cross-platform confirmation dialog.
 *
 * On native, delegates to `Alert.alert()`.
 * On web, falls back to `window.confirm()` (or `window.alert()` if no
 * destructive/default action is provided).
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  // Web fallback
  const cancelBtn = buttons?.find((b) => b.style === "cancel");
  const actionBtn = buttons?.find((b) => b.style !== "cancel");

  if (!actionBtn) {
    // No action button — just show an informational alert
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);

  if (confirmed) {
    actionBtn.onPress?.();
  } else {
    cancelBtn?.onPress?.();
  }
}

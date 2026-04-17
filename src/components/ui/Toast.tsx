/**
 * Toast notification component with animated slide-in/out.
 * Uses Reanimated for smooth animations.
 *
 * @example
 * // Wrap app in ToastProvider
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // Use hook to show toasts
 * const { showToast } = useToast();
 * showToast({ type: 'success', message: 'Account created!' });
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, shadows } from "@theme";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastConfig {
  type: ToastType;
  message: string;
  /** Duration in ms. Default: 3000 */
  duration?: number;
  /** Optional action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast Icons
// ─────────────────────────────────────────────────────────────────────────────

const TOAST_ICONS: Record<ToastType, IconName> = {
  success: "check",
  error: "x",
  info: "info",
  warning: "alert-triangle",
};

const TOAST_COLORS: Record<
  ToastType,
  { bg: string; border: string; icon: string }
> = {
  success: {
    bg: colors.sentiment.successSubtle,
    border: colors.sentiment.success,
    icon: colors.sentiment.success,
  },
  error: {
    bg: colors.sentiment.errorSubtle,
    border: colors.sentiment.error,
    icon: colors.sentiment.error,
  },
  info: {
    bg: colors.sentiment.infoSubtle,
    border: colors.sentiment.info,
    icon: colors.sentiment.info,
  },
  warning: {
    bg: colors.sentiment.warningSubtle,
    border: colors.sentiment.warning,
    icon: colors.sentiment.warning,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Toast Component
// ─────────────────────────────────────────────────────────────────────────────

interface ToastProps {
  config: ToastConfig | null;
  onHide: () => void;
}

function Toast({ config, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const hideWithAnimation = useCallback(() => {
    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onHide)();
    });
    // translateY and opacity are Reanimated SharedValues (stable refs) — not reactive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onHide]);

  useEffect(() => {
    if (config) {
      // Slide in
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto-hide after duration
      const timeout = setTimeout(() => {
        hideWithAnimation();
      }, config.duration ?? 3000);

      return () => clearTimeout(timeout);
    }
    // translateY and opacity are Reanimated SharedValues (stable refs) — not reactive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, hideWithAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!config) return null;

  const colorScheme = TOAST_COLORS[config.type];

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { top: insets.top + spacing.sm },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        style={[
          styles.toast,
          {
            backgroundColor: colorScheme.bg,
            borderLeftColor: colorScheme.border,
          },
        ]}
        onPress={hideWithAnimation}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colorScheme.border },
          ]}
        >
          <Icon
            name={TOAST_ICONS[config.type]}
            size={16}
            color="#fff"
            strokeWidth={2.5}
          />
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {config.message}
        </Text>
        {config.action && (
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              config.action?.onPress();
              hideWithAnimation();
            }}
            accessibilityRole="button"
          >
            <Text style={[styles.actionText, { color: colorScheme.border }]}>
              {config.action.label}
            </Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast Provider
// ─────────────────────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [currentToast, setCurrentToast] = useState<ToastConfig | null>(null);

  const showToast = useCallback((config: ToastConfig) => {
    setCurrentToast(config);
  }, []);

  const hideToast = useCallback(() => {
    setCurrentToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast config={currentToast} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    alignItems: "center",
    ...Platform.select({
      web: {
        position: "fixed" as unknown as "absolute",
      },
    }),
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    backgroundColor: colors.surface.primary,
    maxWidth: 400,
    width: "100%",
    ...shadows.lg,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink.rich,
  },
  actionButton: {
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

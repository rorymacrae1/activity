import { Platform, type ViewStyle } from "react-native";

/**
 * PeakWise Interaction System — Luxury Alpine
 *
 * Philosophy: Interactions should feel responsive but not aggressive.
 * Subtle feedback that doesn't demand attention.
 *
 * iOS: Soft opacity changes
 * Android: Gentle ripple
 * Web: Smooth hover states with transitions
 */

export const interaction = {
  // === Opacity States ===
  opacity: {
    /** Pressed/active state */
    pressed: 0.75,
    /** Hover state (web) */
    hover: 0.92,
    /** Disabled elements */
    disabled: 0.38,
    /** Muted/secondary elements */
    muted: 0.6,
    /** Normal state */
    normal: 1,
  },

  // === Touch Targets (Apple HIG / Material) ===
  touch: {
    /** Minimum touch target (Apple HIG: 44pt) */
    minimum: 44,
    /** Comfortable touch target */
    comfortable: 48,
    /** Large touch target for primary actions */
    large: 56,
    /** Extra large for hero buttons */
    xl: 64,
  },

  // === Click Targets (Desktop — more precise input) ===
  click: {
    minimum: 32,
    comfortable: 36,
    large: 44,
  },

  // === Focus States ===
  focus: {
    /** Focus ring width */
    ringWidth: 2,
    /** Focus ring color (brand-tinted) */
    ringColor: "rgba(78, 144, 133, 0.5)", // glacier.500 with alpha
    /** Focus ring offset */
    ringOffset: 2,
  },

  // === Scale (for press/hover animations) ===
  scale: {
    pressed: 0.97,
    hover: 1.015,
    active: 1.02,
    normal: 1,
  },

  /** @deprecated Use interaction.opacity.pressed */
  pressedOpacity: 0.75,
  /** @deprecated Use interaction.opacity.disabled */
  disabledOpacity: 0.38,
  /** @deprecated Use interaction.touch.minimum */
  minTouchTarget: 44,
  /** @deprecated Use interaction.click.minimum */
  minClickTarget: 32,
  /** @deprecated Use interaction.focus */
  focusRing: {
    width: 2,
    color: "rgba(78, 144, 133, 0.5)",
    offset: 2,
  },
} as const;

/**
 * Web-specific styles for interactive elements.
 * These use CSS properties not available in React Native.
 */
export const webStyles = Platform.select({
  web: {
    /** Pointer cursor for clickable elements */
    clickable: {
      cursor: "pointer",
      userSelect: "none",
    } as ViewStyle,

    /** Not-allowed cursor for disabled elements */
    disabled: {
      cursor: "not-allowed",
      userSelect: "none",
    } as unknown as ViewStyle,

    /** Smooth transitions for luxury feel */
    interactive: {
      transition: `
        transform 200ms cubic-bezier(0.33, 1, 0.68, 1),
        box-shadow 200ms cubic-bezier(0.33, 1, 0.68, 1),
        opacity 150ms cubic-bezier(0.33, 1, 0.68, 1),
        background-color 150ms cubic-bezier(0.33, 1, 0.68, 1)
      `.replace(/\s+/g, " "),
    } as unknown as ViewStyle,

    /** Focus-visible outline for keyboard navigation */
    focusVisible: {
      outlineStyle: "solid",
      outlineWidth: interaction.focus.ringWidth,
      outlineColor: interaction.focus.ringColor,
      outlineOffset: interaction.focus.ringOffset,
    } as unknown as ViewStyle,

    /** Hover lift effect */
    hoverLift: {
      transition:
        "transform 200ms cubic-bezier(0.33, 1, 0.68, 1), box-shadow 200ms cubic-bezier(0.33, 1, 0.68, 1)",
    } as unknown as ViewStyle,
  },
  default: {
    clickable: {} as ViewStyle,
    disabled: {} as ViewStyle,
    interactive: {} as ViewStyle,
    focusVisible: {} as ViewStyle,
    hoverLift: {} as ViewStyle,
  },
})!;

export type Interaction = typeof interaction;

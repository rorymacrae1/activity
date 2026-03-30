import { Platform, type ViewStyle } from "react-native";

/**
 * Interaction states and feedback constants for cross-platform UX.
 * 
 * iOS: Opacity changes on press
 * Android: Ripple effect (handled by Android Pressable)
 * Web: Hover states + cursor changes + focus rings
 */

export const interaction = {
  /** Opacity when element is pressed/active */
  pressedOpacity: 0.7,
  /** Opacity for disabled elements */
  disabledOpacity: 0.4,
  /** Opacity on hover (web only) */
  hoverOpacity: 0.95,
  
  /** Minimum touch target size (Apple HIG: 44pt) */
  minTouchTarget: 44,
  /** Minimum click target for desktop (more precise input) */
  minClickTarget: 32,
  
  /** Focus ring for keyboard navigation (web) */
  focusRing: {
    width: 2,
    color: "rgba(37, 99, 235, 0.5)", // primary with alpha
    offset: 2,
  },
  
  /** Scale values for press animations */
  scale: {
    pressed: 0.97,
    hover: 1.02,
    normal: 1,
  },
} as const;

/**
 * Web-specific styles that can be spread onto components.
 * These use web-only CSS properties.
 */
export const webStyles = Platform.select({
  web: {
    /** Pointer cursor for clickable elements */
    clickable: {
      cursor: "pointer",
    } as ViewStyle,
    
    /** Not-allowed cursor for disabled elements */
    disabled: {
      cursor: "not-allowed",
    } as unknown as ViewStyle,
    
    /** Smooth transitions for hover/active states */
    interactive: {
      transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out, opacity 0.15s ease-out",
    } as unknown as ViewStyle,
    
    /** Focus-visible outline for keyboard navigation */
    focusVisible: {
      outlineStyle: "solid",
      outlineWidth: interaction.focusRing.width,
      outlineColor: interaction.focusRing.color,
      outlineOffset: interaction.focusRing.offset,
    } as unknown as ViewStyle,
  },
  default: {
    clickable: {} as ViewStyle,
    disabled: {} as ViewStyle,
    interactive: {} as ViewStyle,
    focusVisible: {} as ViewStyle,
  },
})!;

export type Interaction = typeof interaction;

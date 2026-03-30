/**
 * PeakWise Motion System — Luxury Alpine
 *
 * Philosophy: Movement should feel natural, elegant, and purposeful.
 * Not bouncy or playful — smooth, confident, and calm.
 *
 * Principles:
 * - Ease-out for entering (natural arrival)
 * - Ease-in for exiting (quick departure)
 * - Spring physics for interactive feedback
 * - Stagger delays for lists and groups
 */

export const animation = {
  // === Durations ===
  duration: {
    /** Instant — no animation, state changes */
    instant: 0,
    /** Micro — subtle feedback (ripples, focus rings) */
    micro: 100,
    /** Quick — interactive feedback (hovers, presses) */
    quick: 150,
    /** Standard — most transitions */
    standard: 250,
    /** Emphasis — important state changes */
    emphasis: 350,
    /** Dramatic — modals, overlays, hero moments */
    dramatic: 500,
    /** Elements entering view */
    enter: 300,
    /** Elements leaving view (faster than enter) */
    exit: 200,
  },

  // === Spring Configs (react-native-reanimated) ===
  spring: {
    /** Quick snap — button presses, toggles */
    snappy: { damping: 22, stiffness: 450, mass: 0.8 },
    /** Natural feel — cards, modals */
    natural: { damping: 18, stiffness: 280, mass: 1 },
    /** Soft landing — page transitions, large elements */
    soft: { damping: 20, stiffness: 180, mass: 1.2 },
    /** Gentle float — subtle hover effects */
    gentle: { damping: 25, stiffness: 120, mass: 1 },
    /** Bouncy — celebratory moments only */
    bouncy: { damping: 12, stiffness: 300, mass: 0.8 },

    /** @deprecated Use spring.natural */
    default: { damping: 18, stiffness: 280, mass: 1 },
  },

  // === Easing (CSS/timing-based animations) ===
  easing: {
    /** Standard ease-out — most transitions */
    out: "cubic-bezier(0.33, 1, 0.68, 1)",
    /** Ease-in — exiting elements */
    in: "cubic-bezier(0.32, 0, 0.67, 0)",
    /** Ease-in-out — continuous motion */
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    /** Linear — progress bars, loading */
    linear: "linear",
    /** Emphasized ease-out — important entrances */
    emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  },

  // === Stagger Delays (lists, grids) ===
  stagger: {
    /** Tight stagger — dense lists */
    tight: 30,
    /** Standard stagger — card grids */
    standard: 50,
    /** Relaxed stagger — hero sections */
    relaxed: 80,
  },

  // === Interactive Scale ===
  scale: {
    /** Pressed state */
    pressed: 0.97,
    /** Hover state (web) */
    hover: 1.02,
    /** Active/selected emphasis */
    active: 1.05,
    /** Normal state */
    normal: 1,
  },
} as const;

export type Animation = typeof animation;

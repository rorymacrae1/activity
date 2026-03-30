/**
 * PeakWise Border Radius System — Luxury Alpine
 *
 * Philosophy: Softer corners feel premium and approachable.
 * Consistent radii create visual harmony across components.
 *
 * Semantic naming — use based on component type, not size.
 */
export const radius = {
  /** No rounding — data tables, technical elements */
  none: 0,
  /** Minimal rounding — inline badges, tabs */
  xs: 4,
  /** Standard small — chips, small buttons */
  sm: 8,
  /** Standard — buttons, inputs */
  md: 12,
  /** Cards and containers */
  lg: 16,
  /** Feature cards, modals */
  xl: 20,
  /** Hero cards, image containers */
  xxl: 24,
  /** Full rounding — pills, avatars, FABs */
  full: 9999,

  // === Semantic (preferred) ===
  /** Standard button radius */
  button: 12,
  /** Input field radius */
  input: 10,
  /** Card radius */
  card: 16,
  /** Modal/sheet radius */
  modal: 24,
  /** Chip/tag radius */
  chip: 9999,
  /** Avatar radius */
  avatar: 9999,
} as const;

export type Radius = typeof radius;

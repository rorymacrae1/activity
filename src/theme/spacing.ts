/**
 * PeakWise Spacing System — Luxury Alpine
 *
 * Philosophy: Generous whitespace creates calm, premium feel.
 * Based on 8px grid with intentional gaps for "breathing room."
 *
 * Named semantically — what it's FOR, not how big it is.
 */
export const spacing = {
  // === Core Scale (8px grid) ===
  none: 0,
  "2xs": 2, // Hairline gaps
  xs: 4, // Tight icon gaps
  sm: 8, // Compact padding
  md: 12, // Standard inner padding
  lg: 16, // Card padding, list gaps
  xl: 24, // Section gaps
  "2xl": 32, // Major section breaks
  "3xl": 48, // Screen sections
  "4xl": 64, // Hero spacing
  "5xl": 96, // Page-level breathing room

  // === Semantic (use these in components) ===
  /** Inline gap between icon and text */
  inlineGap: 8,
  /** Standard card internal padding */
  cardPadding: 20,
  /** Generous card padding for featured items */
  cardPaddingLarge: 28,
  /** Gap between stacked cards/items */
  stackGap: 16,
  /** Section vertical padding */
  sectionY: 32,
  /** Screen horizontal padding (mobile) */
  screenX: 20,
  /** Comfortable reading margin */
  prose: 24,

  // === Legacy Aliases (for migration) ===
  /** @deprecated Use "2xs" */
  xxs: 2,
  /** @deprecated Use "2xl" */
  xxl: 32,
  /** @deprecated Use "3xl" */
  xxxl: 48,
  /** @deprecated Use screenX */
  screen: 20,
} as const;

export type Spacing = typeof spacing;

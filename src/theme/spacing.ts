/**
 * Spacing system — 4px base grid.
 * Use these constants everywhere instead of raw numbers.
 */
export const spacing = {
  xxs: 2,   // micro gaps
  xs: 4,    // icon-label gap
  sm: 8,    // tight padding
  md: 12,   // default inner padding
  lg: 16,   // section padding, card padding
  xl: 24,   // between sections
  xxl: 32,  // screen horizontal padding alternative
  xxxl: 48, // large vertical rhythm
  screen: 20, // standard horizontal screen padding
} as const;

export type Spacing = typeof spacing;

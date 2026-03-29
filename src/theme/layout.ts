/**
 * Layout system — breakpoints, content width constraints, and
 * responsive spacing for phone, tablet, and web.
 *
 * Breakpoints:
 *   phone   < 600px   (iPhone SE → iPhone Pro Max)
 *   tablet  ≥ 600px   (iPad Mini → iPad Pro, large Android tablets, wide web)
 */

export const breakpoints = {
  tablet: 600,
  largeTablet: 900,
} as const;

/**
 * Maximum readable content width on large screens.
 * Content is centered within this boundary.
 */
export const maxContentWidth = 680;

/**
 * Horizontal screen padding that widens on tablet.
 */
export const screenPadding = {
  phone: 20,
  tablet: 40,
} as const;

export type Breakpoints = typeof breakpoints;

/**
 * Layout system — breakpoints, content width constraints, and
 * responsive spacing for phone, tablet, and web.
 *
 * Breakpoints (aligned with industry standards):
 *   phone        < 768px   (iPhone, Android phones)
 *   tablet       ≥ 768px   (iPad portrait, Android tablets) — Tailwind "md"
 *   desktop      ≥ 1024px  (iPad landscape, laptops) — Tailwind "lg"
 *   largeDesktop ≥ 1280px  (Desktop monitors) — Tailwind "xl"
 *
 * Reference:
 *   - iPad Mini/Air portrait: 744–820px
 *   - iPad Pro 11" portrait: 834px
 *   - iPad Pro landscape: 1024–1366px
 *   - Common laptop: 1280–1440px
 */

export const breakpoints = {
  tablet: 768, // iPad portrait, standard tablet breakpoint
  desktop: 1024, // iPad landscape, laptops
  largeDesktop: 1280, // Desktop monitors
} as const;

/**
 * Maximum readable content width on large screens.
 * Content is centered within this boundary.
 */
export const maxContentWidth = {
  /** Default max-width for readable text content */
  prose: 680,
  /** Max-width for card grids and wider layouts */
  content: 960,
  /** Max-width for full-width sections on desktop */
  wide: 1200,
  /** App-wide max-width for the entire shell on large monitors */
  app: 1440,
} as const;

/**
 * Horizontal screen padding that widens on tablet.
 */
export const screenPadding = {
  phone: 16, // Tighter on phone (industry standard)
  tablet: 24, // Comfortable on tablet
  desktop: 32, // Generous on desktop
} as const;

export type Breakpoints = typeof breakpoints;

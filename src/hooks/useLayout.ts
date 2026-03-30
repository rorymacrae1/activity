import { useWindowDimensions, Platform } from "react-native";
import { breakpoints, maxContentWidth, screenPadding } from "@theme/layout";

export type LayoutMode = "phone" | "tablet" | "desktop";

export interface LayoutInfo {
  /** Current screen width in logical pixels */
  screenWidth: number;
  /** Current screen height in logical pixels */
  screenHeight: number;
  /** True when width ≥ 768px — iPad portrait, tablets */
  isTablet: boolean;
  /** True when width ≥ 1024px — iPad landscape, laptops */
  isLargeTablet: boolean;
  /** True when width ≥ 1280px — desktop monitors */
  isDesktop: boolean;
  /** Current layout mode for conditional rendering */
  layoutMode: LayoutMode;
  /** Recommended number of list columns (3 on desktop, 2 on tablet, 1 on phone) */
  numColumns: number;
  /** Max width for centered content containers */
  contentMaxWidth: number;
  /** Horizontal padding that widens on tablet */
  hPadding: number;
  /** Hero image height — scales with screen width */
  heroHeight: number;
  /** Resort card image height */
  cardImageHeight: number;
  /** True when running on web platform */
  isWeb: boolean;
  /** Show sidebar navigation (desktop web) */
  showSideNav: boolean;
}

/**
 * Returns responsive layout info that updates on orientation change.
 *
 * @example
 * const { isTablet, numColumns, hPadding, layoutMode } = useLayout();
 */
export function useLayout(): LayoutInfo {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= breakpoints.tablet;          // ≥768px
  const isLargeTablet = width >= breakpoints.desktop;    // ≥1024px (for backward compat)
  const isDesktop = width >= breakpoints.largeDesktop;   // ≥1280px
  const isWeb = Platform.OS === "web";

  // Determine layout mode
  const layoutMode: LayoutMode = isDesktop ? "desktop" : isTablet ? "tablet" : "phone";

  // Grid columns: 3 on large desktop, 2 on tablet/small desktop, 1 on phone
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  // Responsive padding
  const hPadding = isDesktop 
    ? screenPadding.desktop 
    : isTablet 
      ? screenPadding.tablet 
      : screenPadding.phone;

  return {
    screenWidth: width,
    screenHeight: height,
    isTablet,
    isLargeTablet,
    isDesktop,
    layoutMode,
    numColumns,
    contentMaxWidth: isDesktop ? maxContentWidth.content : maxContentWidth.prose,
    hPadding,
    // Hero image: ~35% of screen height, capped on large screens
    heroHeight: Math.min(Math.round(height * 0.35), isTablet ? 400 : 280),
    // Card image: scales with grid layout
    cardImageHeight: isDesktop ? Math.round(width * 0.12) : isTablet ? Math.round(width * 0.2) : 160,
    isWeb,
    showSideNav: isDesktop && isWeb,
  };
}

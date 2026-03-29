import { useWindowDimensions } from "react-native";
import { breakpoints, maxContentWidth, screenPadding } from "@/theme/layout";

export interface LayoutInfo {
  /** Current screen width in logical pixels */
  screenWidth: number;
  /** Current screen height in logical pixels */
  screenHeight: number;
  /** True when width ≥ 600 — iPad, large Android, wide web */
  isTablet: boolean;
  /** True when width ≥ 900 */
  isLargeTablet: boolean;
  /** Recommended number of list columns (2 on tablet, 1 on phone) */
  numColumns: number;
  /** Max width for centered content containers */
  contentMaxWidth: number;
  /** Horizontal padding that widens on tablet */
  hPadding: number;
  /** Hero image height — scales with screen width */
  heroHeight: number;
  /** Resort card image height */
  cardImageHeight: number;
}

/**
 * Returns responsive layout info that updates on orientation change.
 *
 * @example
 * const { isTablet, numColumns, hPadding } = useLayout();
 */
export function useLayout(): LayoutInfo {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= breakpoints.tablet;
  const isLargeTablet = width >= breakpoints.largeTablet;

  return {
    screenWidth: width,
    screenHeight: height,
    isTablet,
    isLargeTablet,
    numColumns: isTablet ? 2 : 1,
    contentMaxWidth: maxContentWidth,
    hPadding: isTablet ? screenPadding.tablet : screenPadding.phone,
    // Hero image: ~35% of screen height, capped on large screens
    heroHeight: Math.min(Math.round(height * 0.35), isTablet ? 400 : 280),
    // Card image: ~25vw on tablet (two-col grid), fixed on phone
    cardImageHeight: isTablet ? Math.round(width * 0.25) : 160,
  };
}

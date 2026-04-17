import { View, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius, shadows } from "@theme";
import { NavBar } from "@components/ui/NavBar";

/**
 * A curated ski-slope background image used for the quiz on tablet/web.
 * Hosted on Unsplash — same CDN already used for resort hero images.
 */
const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800";

/**
 * Fixed card height on tablet ensures all quiz screens look identical.
 * This prevents jarring container size changes during navigation.
 */
const TABLET_CARD_HEIGHT = 580;
const TABLET_CARD_WIDTH = 520;

interface QuizLayoutProps {
  /** Quiz card content */
  children: React.ReactNode;
  /** Fixed footer (navigation buttons) — stays pinned at bottom */
  footer?: React.ReactNode;
  /** Allow the card itself to scroll (useful for long option lists) */
  scrollable?: boolean;
  /** Show a semi-transparent step label, e.g. "Step 2 of 5" */
  stepLabel?: string;
}

/**
 * Shared wrapper for every onboarding quiz screen.
 *
 * Mobile   — plain white SafeAreaView (unchanged UX)
 * Tablet/Web — full-screen ski-slope photo + centred frosted card (fixed size)
 *
 * @example
 * <QuizLayout scrollable stepLabel="Step 1 of 5">
 *   <Text variant="h2">What's your skiing level?</Text>
 *   ...
 * </QuizLayout>
 */
export function QuizLayout({
  children,
  footer,
  scrollable = false,
  stepLabel: _stepLabel,
}: QuizLayoutProps) {
  const { isTablet } = useLayout();

  if (!isTablet) {
    // ─── Mobile: plain white screen ───────────────────────────────────────────
    // NavBar + mobileBody(flex:1) + mobileFooter as direct SafeAreaView children.
    // Avoids an intermediate flex:1 wrapper whose height Yoga can miscalculate,
    // which causes the footer to visually overlap the last scrollable item.
    return (
      <SafeAreaView style={styles.mobileSafe}>
        <NavBar />
        <View style={styles.mobileBody}>{children}</View>
        {footer && <View style={styles.mobileFooter}>{footer}</View>}
      </SafeAreaView>
    );
  }

  // ─── Tablet / Web: full-screen ski background + fixed-size glass card ─────
  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGE }}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Dark scrim so white card pops */}
      <View style={styles.scrim} />

      <SafeAreaView style={styles.tabletSafe}>
        <NavBar transparent />
        <View style={styles.tabletCenter}>
          {/* Fixed-size glass card */}
          <View style={styles.card}>
            {scrollable ? (
              <ScrollView
                style={styles.cardScroll}
                contentContainerStyle={styles.cardScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={styles.cardContent}>{children}</View>
            )}
            {footer && <View style={styles.cardFooter}>{footer}</View>}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // ── Mobile ──────────────────────────────────────────────────────────────────
  mobileSafe: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: colors.background.primary,
  },
  mobileBody: {
    flex: 1,
  },
  mobileFooter: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.background.primary,
  },

  // ── Tablet ──────────────────────────────────────────────────────────────────
  background: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.onDark.scrim, // navy tint matching brand
  },
  tabletSafe: {
    flex: 1,
    backgroundColor: colors.transparent,
  },
  tabletCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: TABLET_CARD_WIDTH,
    height: TABLET_CARD_HEIGHT,
    backgroundColor: colors.background.primary,
    borderRadius: radius.xxl,
    ...shadows.xl,
    // Subtle top border for glass-like depth
    borderWidth: 1,
    borderColor: colors.onDark.border.subtle,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  cardFooter: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.background.primary,
  },
});

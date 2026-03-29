import { View, StyleSheet, ImageBackground, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius, shadows } from "@theme";

/**
 * A curated ski-slope background image used for the quiz on tablet/web.
 * Hosted on Unsplash — same CDN already used for resort hero images.
 */
const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&q=80";

interface QuizLayoutProps {
  /** Quiz card content */
  children: React.ReactNode;
  /** Allow the card itself to scroll (useful for long option lists) */
  scrollable?: boolean;
  /** Show a semi-transparent step label, e.g. "Step 2 of 5" */
  stepLabel?: string;
}

/**
 * Shared wrapper for every onboarding quiz screen.
 *
 * Mobile   — plain white SafeAreaView (unchanged UX)
 * Tablet/Web — full-screen ski-slope photo + centred frosted card (max-width 520px)
 *
 * @example
 * <QuizLayout scrollable stepLabel="Step 1 of 5">
 *   <Text variant="h2">What's your skiing level?</Text>
 *   ...
 * </QuizLayout>
 */
export function QuizLayout({ children, scrollable = false, stepLabel }: QuizLayoutProps) {
  const { isTablet } = useLayout();

  if (!isTablet) {
    // ─── Mobile: plain white screen ───────────────────────────────────────────
    return (
      <SafeAreaView style={styles.mobileSafe}>
        <View style={styles.mobileContent}>{children}</View>
      </SafeAreaView>
    );
  }

  // ─── Tablet / Web: full-screen ski background + glass card ────────────────
  const CardWrapper = scrollable ? ScrollView : View;

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGE }}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Dark scrim so white card pops */}
      <View style={styles.scrim} />

      <SafeAreaView style={styles.tabletSafe}>
        <View style={styles.tabletCenter}>
          {/* Step indicator above card (optional) */}
          {/* (step label is rendered inside card by child via ProgressIndicator) */}

          {/* Glass card */}
          <CardWrapper
            style={styles.card}
            {...(scrollable ? { contentContainerStyle: styles.cardScrollContent, showsVerticalScrollIndicator: false } : {})}
          >
            {children}
          </CardWrapper>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // ── Mobile ──────────────────────────────────────────────────────────────────
  mobileSafe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  mobileContent: {
    flex: 1,
  },

  // ── Tablet ──────────────────────────────────────────────────────────────────
  background: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,22,40,0.55)", // navy tint matching brand
  },
  tabletSafe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tabletCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: colors.background.primary,
    borderRadius: radius.xxl,
    ...shadows.xl,
    // Subtle top border for glass-like depth
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
});

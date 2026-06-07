import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Head from "expo-router/head";
import { router } from "expo-router";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { usePreferencesStore } from "@stores/preferences";
import { useIsAuthenticated } from "@stores/auth";
import { colors, spacing, radius, shadows } from "@theme";
import { typography } from "@theme/typography";
import { fontFamily } from "@theme/fonts";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Icon, type IconName } from "@components/ui/Icon";
import { NavBar } from "@components/ui/NavBar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  number: string;
  title: string;
  desc: string;
  icon: IconName;
}

interface Reason {
  icon: IconName;
  title: string;
  desc: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Marketing landing page — the first screen users see.
 * Explains what PisteWise does, why it beats alternatives,
 * and offers two paths: start the quiz or create an account.
 */
export default function LandingScreen() {
  const { isTablet, isDesktop, hPadding } = useLayout();
  const content = useContent();
  const t = content.onboarding.landing;
  const hasCompletedOnboarding = usePreferencesStore(
    (s) => s.hasCompletedOnboarding,
  );
  const isAuthenticated = useIsAuthenticated();

  const hPad = isDesktop ? spacing["4xl"] : isTablet ? spacing["2xl"] : hPadding;
  const contentMaxWidth = isDesktop ? 960 : isTablet ? 720 : undefined;
  const constrainedStyle = contentMaxWidth
    ? ({ maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" } as const)
    : undefined;

  const STEPS: Step[] = [
    { number: "1", title: t.step1Title, desc: t.step1Desc, icon: "users" },
    { number: "2", title: t.step2Title, desc: t.step2Desc, icon: "cpu" },
    { number: "3", title: t.step3Title, desc: t.step3Desc, icon: "trophy" },
  ];

  const REASONS: Reason[] = [
    { icon: "shield-check", title: t.reason1Title, desc: t.reason1Desc },
    { icon: "sparkles", title: t.reason2Title, desc: t.reason2Desc },
    { icon: "users-round", title: t.reason3Title, desc: t.reason3Desc },
    { icon: "wifi-off", title: t.reason4Title, desc: t.reason4Desc },
  ];

  const STATS = [
    { value: t.statsResorts, label: t.statsResortsLabel },
    { value: t.statsQuestions, label: t.statsQuestionsLabel },
    { value: t.statsOffline, label: t.statsOfflineLabel },
  ];

  return (
    <View style={styles.safe}>
      <Head>
        <title>Find Your Perfect Ski Resort | PisteWise</title>
        <meta
          name="description"
          content="Answer 5 questions and we'll match you with the ideal ski resort for your group, skill level, and budget. No commission. No bias."
        />
      </Head>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={Platform.OS !== "web"}
      >
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1920&q=85&auto=format&fit=crop",
          }}
          style={[styles.hero, isTablet && styles.heroTablet]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        >
          {/* Dark gradient overlay */}
          <LinearGradient
            colors={[
              "rgba(13,17,23,0.55)",
              "rgba(13,17,23,0.70)",
              "rgba(13,17,23,0.90)",
            ]}
            style={StyleSheet.absoluteFillObject}
          />

          <SafeAreaView edges={["top"]} style={styles.heroSafeArea}>
            <NavBar transparent />
            <View
              style={[
                styles.heroInner,
                { paddingHorizontal: hPad },
                constrainedStyle && { alignSelf: "center", width: "100%", maxWidth: contentMaxWidth },
              ]}
            >
              {/* Mountain badge */}
              <View style={styles.iconBadge}>
                <Icon
                  name="mountain-snow"
                  size={isTablet ? 36 : 28}
                  color="#FFFFFF"
                  strokeWidth={1.5}
                />
              </View>

              {/* Headline */}
              <View style={styles.headlineRow}>
                <Text
                  variant={isTablet ? "displayLarge" : "display"}
                  align="center"
                  style={styles.headline}
                >
                  {t.headline}{" "}
                  <Text
                    variant={isTablet ? "displayLarge" : "display"}
                    color={colors.brand.primary}
                  >
                    {t.headlineAccent}
                  </Text>
                </Text>
              </View>

              <Text
                variant={isTablet ? "bodyLarge" : "body"}
                align="center"
                style={styles.tagline}
              >
                {t.tagline}
              </Text>

              {/* CTA buttons */}
              <View
                style={[
                  styles.ctaGroup,
                  isTablet && styles.ctaGroupTablet,
                ]}
              >
                <View style={[styles.ctaItem, isTablet && styles.ctaItemTablet]}>
                  <Button
                    label={t.ctaQuiz}
                    onPress={() => router.push("/(onboarding)/trip-type")}
                    fullWidth
                    size="prominent"
                    variant="primary"
                  />
                  <Text
                    variant="caption"
                    align="center"
                    style={styles.ctaSub}
                  >
                    {t.ctaQuizSub}
                  </Text>
                </View>

                <View style={[styles.ctaItem, isTablet && styles.ctaItemTablet]}>
                  <Button
                    label={t.ctaAccount}
                    onPress={() => router.push("/(auth)/sign-up")}
                    fullWidth
                    size="prominent"
                    variant="inverse"
                  />
                  <Text
                    variant="caption"
                    align="center"
                    style={styles.ctaSub}
                  >
                    {t.ctaAccountSub}
                  </Text>
                </View>
              </View>

              {/* Returning user shortcut */}
              {hasCompletedOnboarding && isAuthenticated && (
                <Pressable
                  onPress={() => router.replace("/(onboarding)/results")}
                  style={styles.returningBtn}
                  accessibilityRole="button"
                  accessibilityLabel="View my results"
                >
                  <Text style={styles.returningText}>View My Results</Text>
                  <Icon
                    name="arrow-right"
                    size={14}
                    color="#FFFFFF"
                    strokeWidth={2}
                  />
                </Pressable>
              )}
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* ── Stats strip ───────────────────────────────────────────────────── */}
        <View style={[styles.statsStrip, { paddingHorizontal: hPad }]}>
          <View
            style={[
              styles.statsInner,
              constrainedStyle,
            ]}
          >
            {STATS.map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Text variant="stat" color={colors.brand.primary} align="center">
                  {stat.value}
                </Text>
                <Text
                  variant="bodySmall"
                  color={colors.ink.muted}
                  align="center"
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <View style={[styles.section, { paddingHorizontal: hPad }]}>
          <View
            style={[
              constrainedStyle,
            ]}
          >
            <Text
              variant="h2"
              align="center"
              style={styles.sectionTitle}
            >
              {t.howTitle}
            </Text>

            <View style={[styles.steps, isTablet && styles.stepsTablet]}>
              {STEPS.map((step, i) => (
                <View
                  key={i}
                  style={[styles.stepCard, isTablet && styles.stepCardTablet]}
                >
                  {/* Step number + connector */}
                  <View style={styles.stepNumberRow}>
                    <View style={styles.stepNumberBadge}>
                      <Text variant="bodySmallMedium" color={colors.ink.onBrand}>
                        {step.number}
                      </Text>
                    </View>
                    {i < STEPS.length - 1 && !isTablet && (
                      <View style={styles.stepConnector} />
                    )}
                  </View>

                  <View style={styles.stepIcon}>
                    <Icon
                      name={step.icon}
                      size={22}
                      color={colors.brand.primary}
                      strokeWidth={1.75}
                    />
                  </View>

                  <Text variant="h4" style={styles.stepTitle}>
                    {step.title}
                  </Text>
                  <Text variant="bodySmall" color={colors.ink.muted}>
                    {step.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <View style={[styles.divider, { marginHorizontal: hPad }]} />

        {/* ── Why PisteWise ─────────────────────────────────────────────────── */}
        <View style={[styles.section, { paddingHorizontal: hPad }]}>
          <View
            style={[
              constrainedStyle,
            ]}
          >
            <Text
              variant="h2"
              align="center"
              style={styles.sectionTitle}
            >
              {t.whyTitle}
            </Text>

            <View style={[styles.reasons, isTablet && styles.reasonsTablet]}>
              {REASONS.map((reason, i) => (
                <View
                  key={i}
                  style={[
                    styles.reasonCard,
                    isTablet && styles.reasonCardTablet,
                  ]}
                >
                  <View style={styles.reasonIconWrap}>
                    <Icon
                      name={reason.icon}
                      size={20}
                      color={colors.brand.primary}
                      strokeWidth={1.75}
                    />
                  </View>
                  <View style={styles.reasonText}>
                    <Text variant="h4" style={styles.reasonTitle}>
                      {reason.title}
                    </Text>
                    <Text variant="bodySmall" color={colors.ink.muted}>
                      {reason.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <View
          style={[styles.bottomCta, { paddingHorizontal: hPad }]}
        >
          <View
            style={[
              styles.bottomCtaInner,
              constrainedStyle,
            ]}
          >
            <Text variant="h2" align="center" style={styles.bottomCtaTitle}>
              {t.bottomCtaTitle}
            </Text>
            <Text
              variant="body"
              align="center"
              style={styles.bottomCtaSub}
            >
              {t.bottomCtaSub}
            </Text>
            <Button
              label={t.ctaQuiz}
              onPress={() => router.push("/(onboarding)/trip-type")}
              size="prominent"
              variant="primary"
              style={isTablet ? styles.bottomBtnTablet : styles.bottomBtnMobile}
            />

            {/* Sign in link */}
            <View style={styles.signInRow}>
              <Text variant="bodySmall" style={styles.signInPrompt}>
                {t.signInPrompt}{" "}
              </Text>
              <Pressable
                onPress={() => router.push("/(auth)/sign-in")}
                accessibilityRole="link"
                accessibilityLabel={t.signInLink}
              >
                <Text style={styles.signInLink}>{t.signInLink}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Bottom safe area padding */}
        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas.default,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero — full-bleed image
  hero: {
    minHeight: 560,
    justifyContent: "flex-end",
  },
  heroTablet: {
    minHeight: 680,
  },
  heroSafeArea: {
    flex: 1,
  },
  heroInner: {
    alignItems: "center",
    gap: spacing.lg,
    paddingBottom: spacing["3xl"],
    paddingTop: spacing.lg,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headlineRow: {
    alignItems: "center",
  },
  headline: {
    maxWidth: 480,
    color: "#FFFFFF",
  },
  tagline: {
    maxWidth: 480,
    textAlign: "center",
    color: "rgba(255,255,255,0.85)",
  },
  ctaSub: {
    color: "rgba(255,255,255,0.65)",
  },
  ctaGroup: {
    width: "100%",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  ctaGroupTablet: {
    flexDirection: "row",
    maxWidth: 500,
    gap: spacing.lg,
  },
  ctaItem: {
    gap: spacing.xs,
  },
  ctaItemTablet: {
    flex: 1,
  },
  returningBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  returningText: {
    ...typography.label,
    fontFamily: fontFamily.semiBold,
    color: "#FFFFFF",
  },

  // Stats
  statsStrip: {
    backgroundColor: colors.canvas.subtle,
    paddingVertical: spacing.xl,
  },
  statsInner: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },

  // Sections
  section: {
    paddingVertical: spacing["3xl"],
  },
  sectionTitle: {
    marginBottom: spacing["2xl"],
    textAlign: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
  },

  // Steps
  steps: {
    gap: spacing.md,
  },
  stepsTablet: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
  },
  stepCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.card,
    padding: spacing.cardPadding,
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
    ...shadows.sm,
  },
  stepCardTablet: {
    flex: 1,
  },
  stepNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.canvas.inverse,
    alignItems: "center",
    justifyContent: "center",
  },
  stepConnector: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    marginTop: spacing["2xs"],
  },

  // Reasons
  reasons: {
    gap: spacing.md,
  },
  reasonsTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  reasonCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
    backgroundColor: colors.surface.primary,
    borderRadius: radius.card,
    padding: spacing.cardPadding,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
    ...shadows.sm,
  },
  reasonCardTablet: {
    width: "47%",
  },
  reasonIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  reasonText: {
    flex: 1,
    gap: spacing.xs,
  },
  reasonTitle: {
    marginBottom: spacing["2xs"],
  },

  // Bottom CTA — dark navy
  bottomCta: {
    paddingVertical: spacing["4xl"],
    backgroundColor: colors.canvas.inverse,
  },
  bottomCtaInner: {
    alignItems: "center",
    gap: spacing.lg,
  },
  bottomCtaTitle: {
    color: colors.ink.inverse,
  },
  bottomCtaSub: {
    maxWidth: 400,
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
  },
  bottomBtnMobile: {
    width: "100%",
  },
  bottomBtnTablet: {
    minWidth: 260,
  },
  signInRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  signInPrompt: {
    ...typography.bodySmall,
    color: "rgba(255,255,255,0.6)",
  },
  signInLink: {
    ...typography.bodySmall,
    fontFamily: fontFamily.semiBold,
    color: colors.brand.primary,
  },

  bottomPad: {
    height: spacing["2xl"],
  },
});


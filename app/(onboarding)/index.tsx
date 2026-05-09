import { View, StyleSheet, Pressable } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { usePreferencesStore } from "@stores/preferences";
import { colors, spacing, radius } from "@theme";
import { typography } from "@theme/typography";
import { fontFamily } from "@theme/fonts";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Icon, type IconName } from "@components/ui/Icon";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { AnimatedQuizContent } from "@components/onboarding/AnimatedQuizContent";
import { getAllResorts } from "@services/resort";

export default function WelcomeScreen() {
  const { isTablet, hPadding } = useLayout();
  const content = useContent();
  const t = content.onboarding.welcome;
  const resortCount = getAllResorts().length;
  const hasCompletedOnboarding = usePreferencesStore(
    (s) => s.hasCompletedOnboarding,
  );

  const VALUE_PROPS: { icon: IconName; text: string }[] = [
    { icon: "target", text: t.valueProp1 },
    {
      icon: "mountain",
      text: t.valueProp2.replace("{count}", String(resortCount)),
    },
    { icon: "snowflake", text: t.valueProp3 },
  ];

  return (
    <QuizLayout>
      <Head>
        <title>Find Your Perfect Ski Resort | PisteWise</title>
        <meta
          name="description"
          content="Answer a few quick questions and we'll match you with the ideal ski resort for your skill level, budget, and vibe."
        />
      </Head>
      <AnimatedQuizContent animation="parallax">
        <View
          style={[
            styles.content,
            { paddingHorizontal: isTablet ? spacing.xl : hPadding },
          ]}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.iconBadge}>
              <Icon
                name="mountain"
                size={isTablet ? 40 : 32}
                color={colors.brand.primary}
                strokeWidth={1.5}
              />
            </View>
            <Text variant={isTablet ? "display" : "h1"} align="center">
              {t.appTitle}
            </Text>
            <Text
              variant="h3"
              color={colors.ink.normal}
              align="center"
              style={styles.tagline}
            >
              {t.tagline}
            </Text>
            <Text
              variant="body"
              color={colors.ink.muted}
              align="center"
              style={styles.subtitle}
            >
              {t.subtitle}
            </Text>
          </View>

          {/* Value props */}
          <View style={[styles.props, isTablet && styles.propsTablet]}>
            {VALUE_PROPS.map(({ icon, text }) => (
              <View
                key={icon}
                style={[styles.prop, isTablet && styles.propTablet]}
              >
                <View style={styles.propIconWrap}>
                  <Icon
                    name={icon}
                    size={18}
                    color={colors.brand.primary}
                    strokeWidth={1.75}
                  />
                </View>
                <Text variant="body" style={styles.propText}>
                  {text}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View style={styles.cta}>
            <Button
              label={t.cta}
              onPress={() => router.push("/(onboarding)/trip-type")}
              fullWidth
              size="prominent"
            />
            <Text variant="caption" color={colors.ink.muted} align="center">
              {t.ctaSubtext}
            </Text>

            {/* Returning user shortcut */}
            {hasCompletedOnboarding && (
              <Pressable
                onPress={() => router.replace("/(onboarding)/results")}
                style={styles.returningBtn}
                accessibilityRole="button"
                accessibilityLabel={t.returningCta}
              >
                <Text style={styles.returningText}>{t.returningCta}</Text>
                <Icon
                  name="arrow-right"
                  size={14}
                  color={colors.brand.primary}
                  strokeWidth={2}
                />
              </Pressable>
            )}
          </View>
        </View>
      </AnimatedQuizContent>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
  },
  hero: {
    alignItems: "center",
    paddingTop: spacing.xl,
    gap: spacing.xs,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  tagline: {
    marginTop: spacing.xxs,
  },
  subtitle: {
    marginTop: spacing.sm,
    maxWidth: 340,
  },
  props: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  propsTablet: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  prop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  propTablet: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  propIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  propText: {
    flex: 1,
  },
  cta: {
    gap: spacing.sm,
  },
  returningBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  returningText: {
    ...typography.label,
    fontFamily: fontFamily.semiBold,
    color: colors.brand.primary,
  },
});

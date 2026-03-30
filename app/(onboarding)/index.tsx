import { View, StyleSheet } from "react-native";
import Head from "expo-router/head";
import { router } from "expo-router";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { QuizLayout } from "@components/onboarding/QuizLayout";

export default function WelcomeScreen() {
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  const VALUE_PROPS = [
    { icon: "🎯", text: content.onboarding.welcome.valueProp1 },
    { icon: "🏔️", text: content.onboarding.welcome.valueProp2 },
    { icon: "📱", text: content.onboarding.welcome.valueProp3 },
  ];

  return (
    <QuizLayout>
      <Head>
        <title>Find Your Perfect Ski Resort | PeakWise</title>
        <meta name="description" content="Answer a few quick questions and we'll match you with the ideal ski resort for your skill level, budget, and vibe." />
      </Head>
      <View style={[styles.content, { paddingHorizontal: isTablet ? spacing.xl : hPadding }]}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.logo, isTablet && styles.logoLarge]}>⛷️</Text>
          <Text variant={isTablet ? "display" : "h1"} align="center">{content.onboarding.welcome.appTitle}</Text>
          <Text variant="body" color={colors.text.secondary} align="center" style={styles.tagline}>
            {content.onboarding.welcome.tagline}
          </Text>
        </View>

        {/* Value props */}
        <View style={[styles.props, isTablet && styles.propsTablet]}>
          {VALUE_PROPS.map(({ icon, text }) => (
            <Card key={icon} elevation="sm" style={[styles.prop, isTablet && styles.propTablet]}>
              <Text style={styles.propIcon}>{icon}</Text>
              <Text variant="bodySmall" style={styles.propText}>{text}</Text>
            </Card>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Button label={content.onboarding.welcome.cta} onPress={() => router.push("/(onboarding)/trip-type")} fullWidth size="lg" />
          <Text variant="caption" color={colors.text.tertiary} align="center">{content.onboarding.welcome.ctaSubtext}</Text>
        </View>
      </View>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
  },
  hero: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.sm },
  logo: { fontSize: 64, marginBottom: spacing.sm },
  logoLarge: { fontSize: 72 },
  tagline: { marginTop: spacing.xs },
  props: { gap: spacing.sm },
  propsTablet: { flexDirection: "row", gap: spacing.md },
  prop: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md },
  propTablet: { flex: 1, flexDirection: "column", alignItems: "center" },
  propIcon: { fontSize: 24 },
  propText: { flex: 1 },
  cta: { gap: spacing.sm },
});

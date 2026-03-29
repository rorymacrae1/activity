import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useLayout } from "@/hooks/useLayout";
import { colors, spacing } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

const VALUE_PROPS = [
  { icon: "🎯", text: "Personalised recommendations based on your skill and style" },
  { icon: "🏔️", text: "Compare 30+ top European resorts instantly" },
  { icon: "📱", text: "Works offline — take it to the slopes" },
];

export default function WelcomeScreen() {
  const { isTablet, hPadding } = useLayout();

  return (
    <ScreenContainer>
      <View style={[styles.content, { paddingHorizontal: hPadding }]}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.logoEmoji, isTablet && styles.logoEmojiTablet]}>⛷️</Text>
          <Text variant={isTablet ? "display" : "h1"} align="center">PeakWise</Text>
          <Text variant="body" color={colors.text.secondary} align="center" style={styles.tagline}>
            Find your perfect ski resort{"\n"}in seconds
          </Text>
        </View>

        {/* Value props — side-by-side on tablet */}
        <View style={[styles.valueProps, isTablet && styles.valuePropTablet]}>
          {VALUE_PROPS.map(({ icon, text }) => (
            <Card key={icon} elevation="sm" style={[styles.valueProp, isTablet && styles.valuePropTabletItem]}>
              <Text style={styles.valuePropIcon}>{icon}</Text>
              <Text variant="bodySmall" style={styles.valuePropText}>{text}</Text>
            </Card>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Button
            label="Find My Resort"
            onPress={() => router.push("/(onboarding)/skill")}
            fullWidth
            size="lg"
          />
          <Text variant="caption" color={colors.text.tertiary} align="center">
            Takes about 1 minute
          </Text>
        </View>
      </View>
    </ScreenContainer>
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
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  logoEmojiTablet: {
    fontSize: 80,
  },
  tagline: {
    marginTop: spacing.xs,
  },
  valueProps: {
    gap: spacing.sm,
  },
  valuePropTablet: {
    flexDirection: "row",
    gap: spacing.md,
  },
  valueProp: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  valuePropTabletItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  valuePropIcon: {
    fontSize: 24,
  },
  valuePropText: {
    flex: 1,
  },
  cta: {
    gap: spacing.sm,
  },
});

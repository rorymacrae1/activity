import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import type { BudgetLevel } from "@/types/preferences";

const OPTIONS: Array<{ level: BudgetLevel; title: string; range: string; description: string; icon: string }> = [
  { level: "budget",  title: "Budget",    range: "€80–120/day",  description: "Affordable, great value",    icon: "💚" },
  { level: "mid",     title: "Mid-Range", range: "€120–180/day", description: "Balance of quality & price", icon: "💙" },
  { level: "premium", title: "Premium",   range: "€180–280/day", description: "High-quality experience",    icon: "💜" },
  { level: "luxury",  title: "Luxury",    range: "€280+/day",    description: "Top-tier everything",        icon: "⭐" },
];

export default function BudgetScreen() {
  const { budgetLevel, setBudgetLevel } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();

  return (
    <QuizLayout>
      <View style={[styles.inner, { paddingHorizontal: isTablet ? spacing.xl : hPadding }]}>
        <ProgressIndicator current={2} total={5} showLabel />

        <View style={styles.header}>
          <Text variant="h2">What's your budget?</Text>
          <Text variant="body" color={colors.text.secondary}>
            Including lift pass, food, and rental
          </Text>
        </View>

        {/* 2×2 grid on tablet, stacked on mobile */}
        <View style={[styles.grid, isTablet && styles.gridTablet]}>
          {OPTIONS.map((opt) => {
            const active = budgetLevel === opt.level;
            return (
              <Pressable
                key={opt.level}
                style={[styles.option, active && styles.optionActive, isTablet && styles.optionTablet]}
                onPress={() => setBudgetLevel(opt.level)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${opt.title}, ${opt.range}`}
              >
                <View style={styles.optionTop}>
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                  <Text variant="h4" color={active ? colors.primary : colors.text.primary} style={styles.optionTitle}>{opt.title}</Text>
                  <Text variant="captionMedium" color={active ? colors.primary : colors.text.tertiary}>{opt.range}</Text>
                </View>
                <Text variant="bodySmall" color={colors.text.secondary}>{opt.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button label="← Back" variant="ghost" onPress={() => router.back()} style={styles.backBtn} />
          <Button label="Next →" onPress={() => budgetLevel && router.push("/(onboarding)/region")} disabled={!budgetLevel} style={styles.nextBtn} size="lg" />
        </View>
      </View>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingVertical: spacing.md },
  header: { marginTop: spacing.md, marginBottom: spacing.lg, gap: spacing.xs },
  grid: { flex: 1, gap: spacing.sm, justifyContent: "center" },
  gridTablet: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  option: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.background.secondary,
    gap: spacing.xs,
  },
  optionTablet: { width: "47%" },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  optionTop: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  optionIcon: { fontSize: 20 },
  optionTitle: { flex: 1 },
  footer: { flexDirection: "row", gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.sm },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

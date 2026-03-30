import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import type { BudgetLevel } from "@/types/preferences";

export default function BudgetScreen() {
  const { budgetLevel, setBudgetLevel } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  const OPTIONS: Array<{ level: BudgetLevel; title: string; range: string; description: string; icon: string }> = [
    { level: "budget",  title: content.onboarding.budget.options.budget.title,   range: content.onboarding.budget.options.budget.range,   description: content.onboarding.budget.options.budget.description,   icon: "💚" },
    { level: "mid",     title: content.onboarding.budget.options.mid.title,      range: content.onboarding.budget.options.mid.range,      description: content.onboarding.budget.options.mid.description,      icon: "💙" },
    { level: "premium", title: content.onboarding.budget.options.premium.title,  range: content.onboarding.budget.options.premium.range,  description: content.onboarding.budget.options.premium.description,  icon: "💜" },
    { level: "luxury",  title: content.onboarding.budget.options.luxury.title,   range: content.onboarding.budget.options.luxury.range,   description: content.onboarding.budget.options.luxury.description,   icon: "⭐" },
  ];

  return (
    <QuizLayout>
      <View style={[styles.inner, { paddingHorizontal: isTablet ? spacing.xl : hPadding }]}>
        <ProgressIndicator current={3} total={5} showLabel />

        <View style={styles.header}>
          <Text variant="h2">{content.onboarding.budget.title}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {content.onboarding.budget.subtitle}
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
          <Button label={`← ${content.onboarding.budget.back}`} variant="ghost" onPress={() => router.back()} style={styles.backBtn} />
          <Button label={`${content.onboarding.budget.next} →`} onPress={() => budgetLevel && router.push("/(onboarding)/region")} disabled={!budgetLevel} style={styles.nextBtn} size="lg" />
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

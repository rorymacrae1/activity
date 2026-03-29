import { View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import type { BudgetLevel } from "@types/preferences";

const BUDGET_OPTIONS: Array<{ level: BudgetLevel; title: string; range: string; description: string }> = [
  { level: "budget",  title: "Budget",    range: "€80-120/day",  description: "Affordable resorts, good value" },
  { level: "mid",     title: "Mid-Range", range: "€120-180/day", description: "Balance of quality and price" },
  { level: "premium", title: "Premium",   range: "€180-280/day", description: "High-quality resorts" },
  { level: "luxury",  title: "Luxury",    range: "€280+/day",    description: "Top-tier experience" },
];

export default function BudgetScreen() {
  const { budgetLevel, setBudgetLevel } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: hPadding }, isTablet && styles.tabletCenter]}>
        <ProgressIndicator current={2} total={5} />

        <View style={styles.header}>
          <Text variant="h2">What's your budget?</Text>
          <Text variant="body" color={colors.text.secondary}>Including lift pass, food, and rental</Text>
        </View>

        {/* On tablet: 2×2 grid */}
        <View style={[styles.options, isTablet && styles.optionsTablet]}>
          {BUDGET_OPTIONS.map((option) => {
            const selected = budgetLevel === option.level;
            return (
              <Pressable
                key={option.level}
                style={[styles.option, selected && styles.optionSelected, isTablet && styles.optionTablet]}
                onPress={() => setBudgetLevel(option.level)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.title}, ${option.range}`}
              >
                <View style={styles.optionHeader}>
                  <Text variant="h3" color={selected ? colors.primary : colors.text.primary}>{option.title}</Text>
                  <Text variant="bodySmall" color={colors.text.tertiary} style={styles.optionRange}>{option.range}</Text>
                </View>
                <Text variant="bodySmall" color={colors.text.secondary}>{option.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button label="Back" variant="secondary" onPress={() => router.back()} style={styles.backBtn} />
          <Button label="Next" onPress={() => budgetLevel && router.push("/(onboarding)/region")} disabled={!budgetLevel} style={styles.nextBtn} size="lg" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  tabletCenter: { maxWidth: 680, alignSelf: "center" as const, width: "100%" },
  content: { flex: 1, paddingVertical: spacing.md },
  header: { marginTop: spacing.xl, marginBottom: spacing.lg, gap: spacing.xs },
  options: { flex: 1, gap: spacing.sm, justifyContent: "center" },
  optionsTablet: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  option: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.background.secondary,
  },
  optionTablet: { width: "47%" },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  optionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xxs },
  optionRange: { fontWeight: "600" },
  footer: { flexDirection: "row", gap: spacing.md, paddingTop: spacing.md },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

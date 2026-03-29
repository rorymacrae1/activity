import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import type { SkillLevel } from "@/types/preferences";

const OPTIONS: Array<{ level: SkillLevel; title: string; description: string; icon: string }> = [
  { level: "beginner",     title: "Beginner",     description: "Learning the basics, comfortable on green runs", icon: "🟢" },
  { level: "intermediate", title: "Intermediate", description: "Confident on blue runs, working on red",         icon: "🔵" },
  { level: "advanced",     title: "Advanced",     description: "Comfortable on all terrain including blacks",    icon: "⚫" },
];

export default function SkillScreen() {
  const { skillLevel, setSkillLevel } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();

  return (
    <QuizLayout>
      <View style={[styles.inner, { paddingHorizontal: isTablet ? spacing.xl : hPadding }]}>
        <ProgressIndicator current={1} total={5} showLabel />

        <View style={styles.header}>
          <Text variant="h2">What's your skiing level?</Text>
          <Text variant="body" color={colors.text.secondary}>
            We'll find resorts that match your ability
          </Text>
        </View>

        <View style={[styles.options, isTablet && styles.optionsRow]}>
          {OPTIONS.map((opt) => {
            const active = skillLevel === opt.level;
            return (
              <Pressable
                key={opt.level}
                style={[styles.option, active && styles.optionActive, isTablet && styles.optionTablet]}
                onPress={() => setSkillLevel(opt.level)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${opt.title}: ${opt.description}`}
              >
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <View style={styles.optionText}>
                  <Text variant="h4" color={active ? colors.primary : colors.text.primary}>{opt.title}</Text>
                  <Text variant="bodySmall" color={colors.text.secondary}>{opt.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            label="Next →"
            onPress={() => skillLevel && router.push("/(onboarding)/budget")}
            disabled={!skillLevel}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingVertical: spacing.md },
  header: { marginTop: spacing.md, marginBottom: spacing.lg, gap: spacing.xs },
  options: { flex: 1, gap: spacing.md, justifyContent: "center" },
  optionsRow: { flexDirection: "row", gap: spacing.md },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.background.secondary,
    gap: spacing.md,
  },
  optionTablet: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  optionIcon: { fontSize: 32 },
  optionText: { flex: 1 },
  footer: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  tabletCenter: { maxWidth: 520, alignSelf: "center" as const, width: "100%" },
});

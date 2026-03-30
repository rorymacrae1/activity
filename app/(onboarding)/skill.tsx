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
import type { SkillLevel } from "@/types/preferences";

export default function SkillScreen() {
  const { groupAbilities, setGroupAbilities } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  const OPTIONS: Array<{ level: SkillLevel; icon: string }> = [
    { level: "beginner",     icon: "🟢" },
    { level: "intermediate", icon: "🔵" },
    { level: "advanced",     icon: "⚫" },
  ];

  const toggle = (level: SkillLevel) => {
    if (groupAbilities.includes(level)) {
      // Deselect only if it won't leave nothing selected
      if (groupAbilities.length > 1) {
        setGroupAbilities(groupAbilities.filter((l) => l !== level));
      }
    } else {
      setGroupAbilities([...groupAbilities, level]);
    }
  };

  return (
    <QuizLayout>
      <View style={[styles.inner, { paddingHorizontal: isTablet ? spacing.xl : hPadding }]}>
        <ProgressIndicator current={2} total={5} showLabel />

        <View style={styles.header}>
          <Text variant="h2">{content.onboarding.skill.title}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {content.onboarding.skill.subtitle}
          </Text>
        </View>

        <View style={[styles.options, isTablet && styles.optionsRow]}>
          {OPTIONS.map((opt) => {
            const optContent = content.onboarding.skill.options[opt.level];
            const active = groupAbilities.includes(opt.level);
            return (
              <Pressable
                key={opt.level}
                style={[styles.option, active && styles.optionActive, isTablet && styles.optionTablet]}
                onPress={() => toggle(opt.level)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                accessibilityLabel={`${optContent.title}: ${optContent.description}`}
              >
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <View style={styles.optionText}>
                  <Text variant="h4" color={active ? colors.primary : colors.text.primary}>
                    {optContent.title}
                  </Text>
                  <Text variant="bodySmall" color={colors.text.secondary}>
                    {optContent.description}
                  </Text>
                </View>
                {active && (
                  <Text style={styles.checkmark} color={colors.primary}>✓</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            label={`← ${content.onboarding.skill.back}`}
            variant="ghost"
            onPress={() => router.back()}
            style={styles.backBtn}
          />
          <Button
            label={`${content.onboarding.skill.next} →`}
            onPress={() => router.push("/(onboarding)/budget")}
            disabled={groupAbilities.length === 0}
            style={styles.nextBtn}
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
  checkmark: { fontSize: 20, fontWeight: "700" as const },
  footer: { flexDirection: "row", gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.sm },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

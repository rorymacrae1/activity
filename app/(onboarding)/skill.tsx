import { View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { usePreferencesStore } from "@/stores/preferences";
import { useLayout } from "@/hooks/useLayout";
import { colors, spacing, radius } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import type { SkillLevel } from "@/types/preferences";

const SKILL_OPTIONS: Array<{ level: SkillLevel; title: string; description: string; icon: string }> = [
  { level: "beginner",     title: "Beginner",     description: "Learning the basics, comfortable on green runs", icon: "🟢" },
  { level: "intermediate", title: "Intermediate", description: "Confident on blue runs, working on red",         icon: "🔵" },
  { level: "advanced",     title: "Advanced",     description: "Comfortable on all terrain including blacks",    icon: "⚫" },
];

export default function SkillScreen() {
  const { skillLevel, setSkillLevel } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: hPadding }, isTablet && styles.tabletCenter]}>
        <ProgressIndicator current={1} total={5} />

        <View style={styles.header}>
          <Text variant="h2">What's your skiing level?</Text>
          <Text variant="body" color={colors.text.secondary}>We'll find resorts that match your ability</Text>
        </View>

        {/* On tablet: options side by side */}
        <View style={[styles.options, isTablet && styles.optionsTablet]}>
          {SKILL_OPTIONS.map((option) => {
            const selected = skillLevel === option.level;
            return (
              <Pressable
                key={option.level}
                style={[styles.option, selected && styles.optionSelected, isTablet && styles.optionTablet]}
                onPress={() => setSkillLevel(option.level)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.title}: ${option.description}`}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <View style={styles.optionText}>
                  <Text variant="h3" color={selected ? colors.primary : colors.text.primary}>
                    {option.title}
                  </Text>
                  <Text variant="bodySmall" color={colors.text.secondary}>{option.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button label="Next" onPress={() => skillLevel && router.push("/(onboarding)/budget")} disabled={!skillLevel} fullWidth size="lg" />
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
  options: { flex: 1, gap: spacing.md, justifyContent: "center" },
  optionsTablet: { flexDirection: "row", alignItems: "stretch" },
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
  optionTablet: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  optionIcon: { fontSize: 32 },
  optionText: { flex: 1 },
  footer: { paddingTop: spacing.md },
});

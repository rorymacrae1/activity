import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import { AnimatedQuizContent } from "@components/onboarding/AnimatedQuizContent";
import type { SkillLevel } from "@/types/preferences";
import { SKILL_LEVELS } from "@/constants/options";

/** Piste marker colors matching real European ski signage */
const PISTE_COLORS: Record<SkillLevel, string> = {
  beginner: colors.terrain.beginner,
  intermediate: colors.terrain.intermediate,
  red: colors.terrain.red,
  advanced: colors.terrain.advanced,
};

/**
 * Colored piste marker dot — premium alternative to emojis.
 */
function PisteMarker({
  level,
  size = 28,
}: {
  level: SkillLevel;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.pisteMarker,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: PISTE_COLORS[level],
        },
      ]}
    />
  );
}

export default function SkillScreen() {
  const { groupAbilities, setGroupAbilities } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  const OPTIONS = SKILL_LEVELS;

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
    <QuizLayout
      footer={
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
            size="prominent"
          />
        </View>
      }
    >
      <AnimatedQuizContent animation="parallax">
        <View
          style={[styles.inner, !isTablet && { paddingHorizontal: hPadding }]}
        >
          <ProgressIndicator current={2} total={5} showLabel />

          <View style={styles.header}>
            <Text variant="h2">{content.onboarding.skill.title}</Text>
            <Text variant="body" color={colors.text.secondary}>
              {content.onboarding.skill.subtitle}
            </Text>
          </View>

          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={[
              styles.options,
              isTablet && styles.optionsTablet,
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {OPTIONS.map((level) => {
              const optContent = content.onboarding.skill.options[level];
              const active = groupAbilities.includes(level);
              return (
                <Pressable
                  key={level}
                  style={[
                    styles.option,
                    active && styles.optionActive,
                    isTablet && styles.optionRow,
                  ]}
                  onPress={() => toggle(level)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`${optContent.title}: ${optContent.description}`}
                >
                  <PisteMarker level={level} />
                  <View style={styles.optionText}>
                    <Text
                      variant="h4"
                      color={active ? colors.primary : colors.text.primary}
                    >
                      {optContent.title}
                    </Text>
                    <Text variant="bodySmall" color={colors.text.secondary}>
                      {optContent.description}
                    </Text>
                  </View>
                  {active && (
                    <View style={styles.checkmark}>
                      <Text variant="caption" color={colors.primary}>
                        ✓
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </AnimatedQuizContent>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1 },
  header: { marginBottom: spacing.lg, gap: spacing.xs },
  optionsScroll: { flex: 1 },
  options: { gap: spacing.sm, paddingBottom: spacing.sm },
  optionsTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.background.secondary,
    gap: spacing.md,
  },
  optionRow: {
    width: "48%",
    minWidth: 200,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  pisteMarker: {
    // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: { flex: 1 },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { flexDirection: "row", gap: spacing.sm },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

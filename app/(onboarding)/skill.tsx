import { View, StyleSheet, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import {
  AnimatedQuizContent,
  StaggeredItem,
} from "@components/onboarding/AnimatedQuizContent";
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

/** Animated option card with press feedback — mirrors trip-type OptionCard. */
function OptionCard({
  level,
  active,
  onSelect,
  isTablet,
  title,
  description,
}: {
  level: SkillLevel;
  active: boolean;
  onSelect: () => void;
  isTablet: boolean;
  title: string;
  description: string;
}) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect();
  };

  return (
    <Pressable
      style={[
        styles.option,
        isTablet && styles.optionTablet,
        active && styles.optionActive,
      ]}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      accessibilityLabel={`${title}: ${description}`}
    >
      <PisteMarker level={level} />
      <Text
        variant="h4"
        color={active ? colors.brand.primary : colors.ink.rich}
        style={styles.optionTitle}
      >
        {title}
      </Text>
      <Text
        variant="bodySmall"
        color={colors.ink.muted}
        style={styles.optionDesc}
      >
        {description}
      </Text>
      {active && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </Pressable>
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
            onPress={() => router.push("/(onboarding)/trip-type")}
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
            <Text variant="body" color={colors.ink.normal}>
              {content.onboarding.skill.subtitle}
            </Text>
          </View>

          <View
            style={[styles.optionsGrid, isTablet && styles.optionsGridTablet]}
          >
            {OPTIONS.map((level, index) => {
              const optContent = content.onboarding.skill.options[level];
              const active = groupAbilities.includes(level);
              return (
                <StaggeredItem
                  key={level}
                  index={index}
                  baseDelay={80}
                  style={[styles.gridCell, isTablet && styles.gridCellTablet]}
                >
                  <OptionCard
                    level={level}
                    active={active}
                    onSelect={() => toggle(level)}
                    isTablet={isTablet}
                    title={optContent.title}
                    description={optContent.description}
                  />
                </StaggeredItem>
              );
            })}
          </View>
        </View>
      </AnimatedQuizContent>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1 },
  header: { marginBottom: spacing.md, gap: spacing.xs },
  optionsGrid: {
    flex: 1,
    gap: spacing.xs,
  },
  optionsGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
  },
  gridCell: {
    flexGrow: 1,
  },
  gridCellTablet: {
    width: "48%",
    minWidth: 140,
  },
  option: {
    backgroundColor: colors.surface.primary,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  optionTablet: {
    flex: 1,
    padding: spacing.md,
  },
  optionActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySubtle,
  },
  pisteMarker: {
    marginBottom: spacing.xs,
  },
  optionTitle: {
    textAlign: "center",
    marginBottom: spacing.xxs,
  },
  optionDesc: {
    textAlign: "center",
    lineHeight: 18,
  },
  checkmark: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: colors.ink.onBrand,
    fontSize: 14,
    fontWeight: "700",
  },
  footer: { flexDirection: "row", gap: spacing.sm },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

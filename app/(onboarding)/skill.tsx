import { View, Platform, Pressable } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { useQuizGuard } from "@hooks/useQuizGuard";
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
      className={[
        "bg-surface-primary rounded-lg border-2 p-sm items-center justify-center relative",
        active ? "border-brand-primary bg-brand-primary-subtle" : "border-border-subtle",
        isTablet ? "flex-1 p-md" : "",
      ].join(" ")}
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
        <View className="absolute top-xs right-xs w-6 h-6 rounded-full bg-brand-primary items-center justify-center">
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function SkillScreen() {
  const isRedirecting = useQuizGuard();
  const { groupAbilities, setGroupAbilities } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  if (isRedirecting) return null;

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
          className="flex-1"
          style={!isTablet ? { paddingHorizontal: hPadding } : undefined}
        >
          <ProgressIndicator current={2} total={5} showLabel />

          <View className="mb-md gap-xs">
            <Text variant="h2">{content.onboarding.skill.title}</Text>
            <Text variant="body" color={colors.ink.normal}>
              {content.onboarding.skill.subtitle}
            </Text>
          </View>

          <View
            className={isTablet ? "flex-1 flex-row flex-wrap gap-md justify-center" : "flex-1 gap-xs"}
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

const styles = {
  inner: { flex: 1 } as const,
  header: { marginBottom: spacing.md, gap: spacing.xs } as const,
  optionsGrid: { flex: 1, gap: spacing.xs } as const,
  optionsGridTablet: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.md, justifyContent: "center" as const } as const,
  gridCell: { flexGrow: 1 } as const,
  gridCellTablet: { width: "48%", minWidth: 140 } as const,
  option: {
    backgroundColor: colors.surface.primary,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    position: "relative" as const,
  },
  optionTablet: { flex: 1, padding: spacing.md } as const,
  optionActive: { borderColor: colors.brand.primary, backgroundColor: colors.brand.primarySubtle } as const,
  pisteMarker: { marginBottom: spacing.xs } as const,
  optionTitle: { textAlign: "center" as const, marginBottom: spacing.xxs } as const,
  optionDesc: { textAlign: "center" as const, lineHeight: 18 } as const,
  checkmark: {
    position: "absolute" as const,
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  checkmarkText: { color: colors.ink.onBrand, fontSize: 14, fontWeight: "700" as const } as const,
  footer: { flexDirection: "row" as const, gap: spacing.sm } as const,
  backBtn: { flex: 1 } as const,
  nextBtn: { flex: 2 } as const,
};

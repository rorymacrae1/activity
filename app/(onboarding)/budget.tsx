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
import type { BudgetLevel } from "@/types/preferences";

interface BudgetOption {
  level: BudgetLevel;
  title: string;
  range: string;
  description: string;
}

/**
 * Animated option card with press feedback and selection state.
 */
function OptionCard({
  opt,
  active,
  onSelect,
  isTablet,
}: {
  opt: BudgetOption;
  active: boolean;
  onSelect: () => void;
  isTablet: boolean;
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
        "bg-surface-primary rounded-lg border-2 gap-2xs relative overflow-hidden p-sm",
        active ? "border-brand-primary bg-brand-primary-subtle" : "border-border-subtle",
        isTablet ? "flex-1 p-md" : "",
      ].join(" ")}
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${opt.title}, ${opt.range}. ${opt.description}`}
    >
      {/* Header row: Title + Price */}
      <View className="gap-2xs">
        <View className="flex-row items-center justify-between">
          <Text
            variant="bodyMedium"
            color={active ? colors.brand.primary : colors.ink.rich}
            style={styles.optionTitle}
          >
            {opt.title}
          </Text>
          {active && (
            <View className="w-6 h-6 rounded-full bg-brand-primary items-center justify-center">
              <Text variant="caption" color={colors.ink.onBrand}>
                ✓
              </Text>
            </View>
          )}
        </View>
        <Text
          variant="bodySmallMedium"
          color={active ? colors.brand.primary : colors.ink.muted}
        >
          {opt.range}
        </Text>
      </View>

      {/* Description */}
      <Text
        variant="bodySmall"
        color={colors.ink.normal}
        style={styles.optionDesc}
      >
        {opt.description}
      </Text>
    </Pressable>
  );
}

export default function BudgetScreen() {
  const isRedirecting = useQuizGuard();
  const { budgetLevel, setBudgetLevel } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  if (isRedirecting) return null;

  const OPTIONS: BudgetOption[] = [
    {
      level: "budget",
      title: content.onboarding.budget.options.budget.title,
      range: content.onboarding.budget.options.budget.range,
      description: content.onboarding.budget.options.budget.description,
    },
    {
      level: "mid",
      title: content.onboarding.budget.options.mid.title,
      range: content.onboarding.budget.options.mid.range,
      description: content.onboarding.budget.options.mid.description,
    },
    {
      level: "premium",
      title: content.onboarding.budget.options.premium.title,
      range: content.onboarding.budget.options.premium.range,
      description: content.onboarding.budget.options.premium.description,
    },
    {
      level: "luxury",
      title: content.onboarding.budget.options.luxury.title,
      range: content.onboarding.budget.options.luxury.range,
      description: content.onboarding.budget.options.luxury.description,
    },
  ];

  return (
    <QuizLayout
      footer={
        <View style={styles.footer}>
          <Button
            label={`← ${content.onboarding.budget.back}`}
            variant="ghost"
            onPress={() => router.push("/(onboarding)/skill")}
            style={styles.backBtn}
          />
          <Button
            label={`${content.onboarding.budget.next} →`}
            onPress={() => budgetLevel && router.push("/(onboarding)/region")}
            disabled={!budgetLevel}
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
          <ProgressIndicator current={3} total={5} showLabel />

          {/* Header */}
          <View className="mb-md gap-xs">
            <Text variant="h2">{content.onboarding.budget.title}</Text>
            <Text variant="bodySmall" color={colors.ink.normal}>
              {content.onboarding.budget.subtitle}
            </Text>
          </View>

          {/* Options grid */}
          <View
            className={isTablet ? "flex-1 flex-row flex-wrap gap-md" : "flex-1 gap-xs"}
          >
            {OPTIONS.map((opt, index) => (
              <StaggeredItem
                key={opt.level}
                index={index}
                baseDelay={80}
                style={[styles.gridCell, isTablet && styles.gridCellTablet]}
              >
                <OptionCard
                  opt={opt}
                  active={budgetLevel === opt.level}
                  onSelect={() => setBudgetLevel(opt.level)}
                  isTablet={isTablet}
                />
              </StaggeredItem>
            ))}
          </View>

          {/* Reassurance hint */}
          <Text variant="caption" color={colors.ink.muted} style={styles.hint}>
            {content.onboarding.budget.hint}
          </Text>
        </View>
      </AnimatedQuizContent>
    </QuizLayout>
  );
}

const styles = {
  inner: { flex: 1 } as const,
  header: { marginBottom: spacing.md, gap: spacing.xs } as const,
  grid: { flex: 1, gap: spacing.xs } as const,
  gridTablet: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: spacing.md } as const,
  gridCell: { flexGrow: 1 } as const,
  gridCellTablet: { width: "48%", minWidth: 140 } as const,
  option: {
    backgroundColor: colors.surface.primary,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    gap: spacing.xxs,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  optionTablet: { flex: 1, padding: spacing.md } as const,
  optionActive: { borderColor: colors.brand.primary, backgroundColor: colors.brand.primarySubtle } as const,
  optionHeader: { gap: spacing.xxs } as const,
  optionTitleRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const } as const,
  optionTitle: { flex: 1 } as const,
  optionDesc: { marginTop: spacing.xxs } as const,
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  hint: { textAlign: "center" as const, marginTop: spacing.md, paddingBottom: spacing.xs } as const,
  footer: { flexDirection: "row" as const, gap: spacing.sm } as const,
  backBtn: { flex: 1 } as const,
  nextBtn: { flex: 2 } as const,
};

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
      style={[
        styles.option,
        active && styles.optionActive,
        isTablet && styles.optionTablet,
      ]}
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${opt.title}, ${opt.range}. ${opt.description}`}
    >
      {/* Header row: Title + Price */}
      <View style={styles.optionHeader}>
        <View style={styles.optionTitleRow}>
          <Text
            variant="bodyMedium"
            color={active ? colors.brand.primary : colors.ink.rich}
            style={styles.optionTitle}
          >
            {opt.title}
          </Text>
          {active && (
            <View style={styles.checkmark}>
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
  const { budgetLevel, setBudgetLevel } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

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
          style={[styles.inner, !isTablet && { paddingHorizontal: hPadding }]}
        >
          <ProgressIndicator current={3} total={5} showLabel />

          {/* Header */}
          <View style={styles.header}>
            <Text variant="h2">{content.onboarding.budget.title}</Text>
            <Text variant="bodySmall" color={colors.ink.normal}>
              {content.onboarding.budget.subtitle}
            </Text>
          </View>

          {/* Scrollable options area for mobile */}
          <View style={[styles.grid, isTablet && styles.gridTablet]}>
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

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  grid: {
    flex: 1,
    gap: spacing.xs,
  },
  gridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
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
    gap: spacing.xxs,
    position: "relative",
    overflow: "hidden",
  },
  optionTablet: {
    flex: 1,
    padding: spacing.md,
  },
  optionActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySubtle,
  },
  optionHeader: {
    gap: spacing.xxs,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionTitle: {
    flex: 1,
  },
  optionDesc: {
    marginTop: spacing.xxs,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    textAlign: "center",
    marginTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});

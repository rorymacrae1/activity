import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BudgetOption {
  level: BudgetLevel;
  title: string;
  range: string;
  description: string;
  badge?: string;
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect();
  };

  return (
    <AnimatedPressable
      style={[
        styles.option,
        active && styles.optionActive,
        isTablet && styles.optionTablet,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${opt.title}, ${opt.range}. ${opt.description}`}
    >
      {/* Badge (e.g., "Most popular") */}
      {opt.badge && (
        <View style={styles.badge}>
          <Text
            variant="caption"
            color={colors.ink.inverse}
            style={styles.badgeText}
          >
            {opt.badge}
          </Text>
        </View>
      )}

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
              <Text variant="caption" color={colors.brand.primary}>
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
    </AnimatedPressable>
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
      badge: content.onboarding.budget.options.mid.badge,
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
            onPress={() => router.back()}
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
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[styles.grid, isTablet && styles.gridTablet]}
            showsVerticalScrollIndicator={Platform.OS !== "web"}
            bounces={false}
          >
            {OPTIONS.map((opt, index) => (
              <StaggeredItem key={opt.level} index={index} baseDelay={80} style={isTablet ? styles.optionTabletWrapper : undefined}>
                <OptionCard
                  opt={opt}
                  active={budgetLevel === opt.level}
                  onSelect={() => setBudgetLevel(opt.level)}
                  isTablet={isTablet}
                />
              </StaggeredItem>
            ))}

            {/* Reassurance hint - inside scroll on mobile */}
            <Text
              variant="caption"
              color={colors.ink.muted}
              style={styles.hint}
            >
              {content.onboarding.budget.hint}
            </Text>
          </ScrollView>
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
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  scrollArea: {
    flex: 1,
  },
  grid: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  gridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.canvas.subtle,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.canvas.subtle,
    gap: spacing.xxs,
    position: "relative",
    overflow: "hidden",
  },
  optionTabletWrapper: {
    width: "47%",
  },
  optionTablet: {
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  optionActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.primarySubtle,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderBottomLeftRadius: radius.sm,
  },
  badgeText: {
    fontWeight: "600",
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

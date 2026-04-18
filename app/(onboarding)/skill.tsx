import { View, StyleSheet, Pressable, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
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
import type { SkillLevel } from "@/types/preferences";
import { SKILL_LEVELS } from "@/constants/options";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: interpolate(pressed.value, [0, 1], [0.08, 0.15]),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    pressed.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    pressed.value = withTiming(0, { duration: 200 });
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
        isTablet && styles.optionRow,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      accessibilityLabel={`${title}: ${description}`}
    >
      <PisteMarker level={level} />
      <View style={styles.optionText}>
        <Text
          variant="h4"
          color={active ? colors.brand.primary : colors.ink.rich}
        >
          {title}
        </Text>
        <Text variant="bodySmall" color={colors.ink.normal}>
          {description}
        </Text>
      </View>
      {active && (
        <View style={styles.checkmark}>
          <Text variant="caption" color={colors.brand.primary}>
            ✓
          </Text>
        </View>
      )}
    </AnimatedPressable>
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
            <Text variant="body" color={colors.ink.normal}>
              {content.onboarding.skill.subtitle}
            </Text>
          </View>

          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={[
              styles.options,
              isTablet && styles.optionsTablet,
            ]}
            showsVerticalScrollIndicator={Platform.OS !== "web"}
            bounces={false}
          >
            {OPTIONS.map((level, index) => {
              const optContent = content.onboarding.skill.options[level];
              const active = groupAbilities.includes(level);
              return (
                <StaggeredItem key={level} index={index} baseDelay={80}>
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
    backgroundColor: colors.canvas.subtle,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.canvas.subtle,
    gap: spacing.md,
  },
  optionRow: {
    width: "48%",
    minWidth: 200,
  },
  optionActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.primarySubtle,
  },
  pisteMarker: {
    // Subtle shadow for depth
    shadowColor: colors.shadow,
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

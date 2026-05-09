import { View, StyleSheet, Platform, Pressable } from "react-native";
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
import type { TripType } from "@/types/preferences";

/**
 * Stylized person silhouette — luxury line-art aesthetic.
 * Uses a simple geometric approach: circle head + curved body.
 */
function PersonIcon({
  size = 24,
  color,
  style,
}: {
  size?: number;
  color: string;
  style?: object;
}) {
  const headSize = size * 0.35;
  const bodyWidth = size * 0.45;
  const bodyHeight = size * 0.5;

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={[{ width: size, height: size, alignItems: "center" }, style]}>
      {/* Head */}
      <View
        style={{
          width: headSize,
          height: headSize,
          borderRadius: headSize / 2,
          backgroundColor: color,
        }}
      />
      {/* Body - rounded trapezoid shape */}
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          backgroundColor: color,
          borderTopLeftRadius: bodyWidth * 0.3,
          borderTopRightRadius: bodyWidth * 0.3,
          borderBottomLeftRadius: bodyWidth * 0.5,
          borderBottomRightRadius: bodyWidth * 0.5,
          marginTop: size * 0.05,
        }}
      />
    </View>
  );
}

/**
 * Visual group composition with stylized person silhouettes.
 */
function GroupVisual({ type, active }: { type: TripType; active: boolean }) {
  const color = active ? colors.brand.primary : colors.ink.muted;
  const configs: Record<TripType, { count: number; sizes: number[] }> = {
    solo: { count: 1, sizes: [24] },
    couple: { count: 2, sizes: [22, 22] },
    family: { count: 4, sizes: [20, 20, 14, 14] }, // Adults + kids
    friends: { count: 4, sizes: [18, 18, 18, 18] },
  };

  const { sizes } = configs[type];

  return (
    <View style={groupStyles.container}>
      {sizes.map((size, i) => (
        <PersonIcon key={i} size={size} color={color} />
      ))}
    </View>
  );
}

const groupStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
    height: 30,
    marginBottom: spacing.xs,
  },
});

/**
 * Animated option card with press feedback.
 */
function OptionCard({
  value,
  title,
  description,
  active,
  onSelect,
  isTablet,
}: {
  value: TripType;
  title: string;
  description: string;
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
      accessibilityLabel={`${title}: ${description}`}
    >
      {/* Group visual */}
      <GroupVisual type={value} active={active} />

      {/* Title */}
      <Text
        variant="h3"
        color={active ? colors.brand.primary : colors.ink.rich}
        style={styles.optionTitle}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        variant="bodySmall"
        color={colors.ink.muted}
        style={styles.optionDesc}
      >
        {description}
      </Text>

      {/* Selection indicator */}
      {active && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function TripTypeScreen() {
  const { tripType, setTripType } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  const OPTIONS: TripType[] = ["solo", "couple", "family", "friends"];

  return (
    <QuizLayout
      footer={
        <View style={styles.footer}>
          <Button
            label={`${content.onboarding.tripType.next} →`}
            onPress={() => tripType && router.push("/(onboarding)/skill")}
            disabled={!tripType}
            fullWidth
            size="prominent"
          />
        </View>
      }
    >
      <AnimatedQuizContent animation="parallax">
        <View
          style={[styles.inner, !isTablet && { paddingHorizontal: hPadding }]}
        >
          <ProgressIndicator current={1} total={5} showLabel />

          <View style={styles.header}>
            <Text variant="h2">{content.onboarding.tripType.title}</Text>
            <Text variant="body" color={colors.ink.normal}>
              {content.onboarding.tripType.subtitle}
            </Text>
          </View>

          <View
            style={[styles.optionsGrid, isTablet && styles.optionsGridTablet]}
          >
            {OPTIONS.map((value, index) => {
              const optContent = content.onboarding.tripType.options[value];
              return (
                <StaggeredItem
                  key={value}
                  index={index}
                  baseDelay={80}
                  style={[styles.gridCell, isTablet && styles.gridCellTablet]}
                >
                  <OptionCard
                    value={value}
                    title={optContent.title}
                    description={optContent.description}
                    active={tripType === value}
                    onSelect={() => setTripType(value)}
                    isTablet={isTablet}
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  optionTablet: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  optionActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySubtle,
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
  footer: {},
});

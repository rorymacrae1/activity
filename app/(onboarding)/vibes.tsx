import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { useQuizGuard } from "@hooks/useQuizGuard";
import { colors, spacing } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Slider } from "@components/ui/Slider";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import {
  AnimatedQuizContent,
  StaggeredItem,
} from "@components/onboarding/AnimatedQuizContent";

const MONTHS = [
  { value: 12, label: "Dec" },
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
];

export default function VibesScreen() {
  const isRedirecting = useQuizGuard();
  const {
    crowdPreference,
    familyVsNightlife,
    preferredMonths,
    setCrowdPreference,
    setFamilyVsNightlife,
    setPreferredMonths,
  } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  if (isRedirecting) return null;

  const crowdLabel =
    crowdPreference <= 2
      ? content.onboarding.vibes.crowd.quiet
      : crowdPreference >= 4
        ? content.onboarding.vibes.crowd.lively
        : content.onboarding.vibes.crowd.moderate;
  const familyLabel =
    familyVsNightlife <= 2
      ? content.onboarding.vibes.focus.family
      : familyVsNightlife >= 4
        ? content.onboarding.vibes.focus.nightlife
        : content.onboarding.vibes.focus.balanced;

  const toggleMonth = (month: number) => {
    const next = preferredMonths.includes(month)
      ? preferredMonths.filter((m) => m !== month)
      : [...preferredMonths, month];
    setPreferredMonths(next);
  };

  return (
    <QuizLayout
      footer={
        <View style={styles.footer}>
          <Button
            label={`← ${content.onboarding.vibes.back}`}
            variant="ghost"
            onPress={() => router.push("/(onboarding)/region")}
            style={styles.backBtn}
          />
          <Button
            label={`${content.onboarding.vibes.next} →`}
            onPress={() => router.push("/(onboarding)/review")}
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
          <ProgressIndicator current={5} total={5} showLabel />

          <View className="mb-lg gap-xs">
            <Text variant="h2">{content.onboarding.vibes.title}</Text>
            <Text variant="body" color={colors.ink.normal}>
              {content.onboarding.vibes.subtitle}
            </Text>
          </View>

          <View className="flex-1 gap-xl justify-center">
            <StaggeredItem index={0} baseDelay={100}>
              <SliderRow
                label={content.onboarding.vibes.crowd.label}
                value={crowdPreference}
                valueLabel={crowdLabel}
                onChange={setCrowdPreference}
                left={content.onboarding.vibes.crowd.left}
                right={content.onboarding.vibes.crowd.right}
                accessLabel="Crowd level"
                accessHint="Slide right for lively"
              />
            </StaggeredItem>
            <StaggeredItem index={1} baseDelay={100}>
              <SliderRow
                label={content.onboarding.vibes.focus.label}
                value={familyVsNightlife}
                valueLabel={familyLabel}
                onChange={setFamilyVsNightlife}
                left={content.onboarding.vibes.focus.left}
                right={content.onboarding.vibes.focus.right}
                accessLabel="Resort focus"
                accessHint="Slide right for nightlife"
              />
            </StaggeredItem>
            <StaggeredItem index={2} baseDelay={100}>
              <View className="gap-xs">
                <Text variant="h4">
                  {content.onboarding.vibes.months.label}
                </Text>
                <View className="flex-row flex-wrap gap-sm mt-xs">
                  {MONTHS.map(({ value, label }) => {
                    const selected = preferredMonths.includes(value);
                    return (
                      <Pressable
                        key={value}
                        onPress={() => toggleMonth(value)}
                        className={[
                          "px-md py-sm rounded-full border",
                          selected
                            ? "bg-brand-primary border-brand-primary"
                            : "bg-surface-secondary border-border-subtle",
                        ].join(" ")}
                        accessibilityLabel={`${label} ${selected ? "selected" : "not selected"}`}
                        accessibilityRole="button"
                      >
                        <Text
                          variant="bodySmall"
                          color={
                            selected ? colors.ink.onBrand : colors.ink.normal
                          }
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </StaggeredItem>
          </View>
        </View>
      </AnimatedQuizContent>
    </QuizLayout>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  valueLabel: string;
  onChange: (v: number) => void;
  left: string;
  right: string;
  accessLabel: string;
  accessHint: string;
}
function SliderRow({
  label,
  value,
  valueLabel,
  onChange,
  left,
  right,
  accessLabel,
  accessHint,
}: SliderRowProps) {
  return (
    <View className="gap-xs">
      <View className="flex-row justify-between items-center">
        <Text variant="h4">{label}</Text>
        <Text variant="bodySmall" color={colors.ink.normal}>
          {valueLabel}
        </Text>
      </View>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={1}
        maximumValue={5}
        step={1}
        accessibilityLabel={accessLabel}
        accessibilityHint={accessHint}
      />
      <View className="flex-row justify-between">
        <Text variant="caption" color={colors.ink.muted}>
          {left}
        </Text>
        <Text variant="caption" color={colors.ink.muted}>
          {right}
        </Text>
      </View>
    </View>
  );
}

const styles = {
  inner: { flex: 1 } as const,
  header: { marginBottom: spacing.lg, gap: spacing.xs } as const,
  sliders: { flex: 1, gap: spacing.xl, justifyContent: "center" as const } as const,
  footer: { flexDirection: "row" as const, gap: spacing.sm } as const,
  backBtn: { flex: 1 } as const,
  nextBtn: { flex: 2 } as const,
  monthGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  monthChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.surface.secondary,
  } as const,
  monthChipSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  } as const,
};
const rowStyles = {
  wrap: { gap: spacing.xs } as const,
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  ends: { flexDirection: "row" as const, justifyContent: "space-between" as const } as const,
};

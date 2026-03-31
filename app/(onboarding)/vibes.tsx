import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Slider } from "@components/ui/Slider";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";

export default function VibesScreen() {
  const {
    crowdPreference,
    familyVsNightlife,
    snowImportance,
    setCrowdPreference,
    setFamilyVsNightlife,
    setSnowImportance,
  } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

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
  const snowLabel =
    snowImportance <= 2
      ? content.onboarding.vibes.snow.flexible
      : snowImportance >= 4
        ? content.onboarding.vibes.snow.critical
        : content.onboarding.vibes.snow.important;

  return (
    <QuizLayout
      footer={
        <View style={styles.footer}>
          <Button
            label={`← ${content.onboarding.vibes.back}`}
            variant="ghost"
            onPress={() => router.back()}
            style={styles.backBtn}
          />
          <Button
            label={`${content.onboarding.vibes.next} →`}
            onPress={() => router.push("/(onboarding)/results")}
            style={styles.nextBtn}
            size="prominent"
          />
        </View>
      }
    >
      <View
        style={[styles.inner, !isTablet && { paddingHorizontal: hPadding }]}
      >
        <ProgressIndicator current={5} total={5} showLabel />

        <View style={styles.header}>
          <Text variant="h2">{content.onboarding.vibes.title}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {content.onboarding.vibes.subtitle}
          </Text>
        </View>

        <View style={styles.sliders}>
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
          <SliderRow
            label={content.onboarding.vibes.snow.label}
            value={snowImportance}
            valueLabel={snowLabel}
            onChange={setSnowImportance}
            left={content.onboarding.vibes.snow.left}
            right={content.onboarding.vibes.snow.right}
            accessLabel="Snow importance"
            accessHint="Slide right if snow is critical"
          />
        </View>
      </View>
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
    <View style={rowStyles.wrap}>
      <View style={rowStyles.header}>
        <Text variant="h4">{label}</Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
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
      <View style={rowStyles.ends}>
        <Text variant="caption" color={colors.text.tertiary}>
          {left}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {right}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1 },
  header: { marginBottom: spacing.lg, gap: spacing.xs },
  sliders: { flex: 1, gap: spacing.xl, justifyContent: "center" },
  footer: { flexDirection: "row", gap: spacing.sm },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});
const rowStyles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ends: { flexDirection: "row", justifyContent: "space-between" },
});

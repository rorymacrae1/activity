import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Slider } from "@components/ui/Slider";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";

export default function VibesScreen() {
  const {
    crowdPreference, familyVsNightlife, snowImportance,
    setCrowdPreference, setFamilyVsNightlife, setSnowImportance,
  } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();

  const crowdLabel  = crowdPreference  <= 2 ? "🧘 Quiet"    : crowdPreference  >= 4 ? "🎉 Lively"    : "👥 Moderate";
  const familyLabel = familyVsNightlife <= 2 ? "👨‍👩‍👧 Family" : familyVsNightlife >= 4 ? "🍻 Nightlife" : "⚖️ Balanced";
  const snowLabel   = snowImportance   <= 2 ? "🤷 Flexible" : snowImportance   >= 4 ? "❄️ Critical"  : "👍 Important";

  return (
    <QuizLayout>
      <View style={[styles.inner, { paddingHorizontal: isTablet ? spacing.xl : hPadding }]}>
        <ProgressIndicator current={4} total={5} showLabel />

        <View style={styles.header}>
          <Text variant="h2">What's your vibe?</Text>
          <Text variant="body" color={colors.text.secondary}>
            Tell us about your ideal resort atmosphere
          </Text>
        </View>

        <View style={styles.sliders}>
          <SliderRow label="Crowd Level"       value={crowdPreference}  valueLabel={crowdLabel}  onChange={setCrowdPreference}  left="Peaceful"         right="Bustling"        accessLabel="Crowd level"        accessHint="Slide right for lively" />
          <SliderRow label="Resort Focus"      value={familyVsNightlife} valueLabel={familyLabel} onChange={setFamilyVsNightlife} left="Family-friendly" right="Après-ski"       accessLabel="Resort focus"       accessHint="Slide right for nightlife" />
          <SliderRow label="Snow Reliability"  value={snowImportance}   valueLabel={snowLabel}   onChange={setSnowImportance}   left="Not a priority"   right="Must have snow"  accessLabel="Snow importance"    accessHint="Slide right if snow is critical" />
        </View>

        <View style={styles.footer}>
          <Button label="← Back" variant="ghost" onPress={() => router.back()} style={styles.backBtn} />
          <Button label="See Results →" onPress={() => router.push("/(onboarding)/results")} style={styles.nextBtn} size="lg" />
        </View>
      </View>
    </QuizLayout>
  );
}

interface SliderRowProps {
  label: string; value: number; valueLabel: string; onChange: (v: number) => void;
  left: string; right: string; accessLabel: string; accessHint: string;
}
function SliderRow({ label, value, valueLabel, onChange, left, right, accessLabel, accessHint }: SliderRowProps) {
  return (
    <View style={rowStyles.wrap}>
      <View style={rowStyles.header}>
        <Text variant="h4">{label}</Text>
        <Text variant="bodySmall" color={colors.text.secondary}>{valueLabel}</Text>
      </View>
      <Slider value={value} onValueChange={onChange} minimumValue={1} maximumValue={5} step={1}
        accessibilityLabel={accessLabel} accessibilityHint={accessHint} />
      <View style={rowStyles.ends}>
        <Text variant="caption" color={colors.text.tertiary}>{left}</Text>
        <Text variant="caption" color={colors.text.tertiary}>{right}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingVertical: spacing.md },
  header: { marginTop: spacing.md, marginBottom: spacing.lg, gap: spacing.xs },
  sliders: { flex: 1, gap: spacing.xl, justifyContent: "center" },
  footer: { flexDirection: "row", gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.sm },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});
const rowStyles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ends: { flexDirection: "row", justifyContent: "space-between" },
});

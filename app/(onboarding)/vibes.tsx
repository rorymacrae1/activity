import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { usePreferencesStore } from "@/stores/preferences";
import { useLayout } from "@/hooks/useLayout";
import { colors, spacing } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { Slider } from "@/components/ui/Slider";

export default function VibesScreen() {
  const {
    crowdPreference, familyVsNightlife, snowImportance,
    setCrowdPreference, setFamilyVsNightlife, setSnowImportance,
  } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();

  const crowdLabel = crowdPreference <= 2 ? "🧘 Quiet" : crowdPreference >= 4 ? "🎉 Lively" : "👥 Moderate";
  const familyLabel = familyVsNightlife <= 2 ? "👨‍👩‍👧 Family" : familyVsNightlife >= 4 ? "🍻 Nightlife" : "⚖️ Balanced";
  const snowLabel = snowImportance <= 2 ? "🤷 Flexible" : snowImportance >= 4 ? "❄️ Critical" : "👍 Important";

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: hPadding }, isTablet && styles.tabletCenter]}>
        <ProgressIndicator current={4} total={5} />

        <View style={styles.header}>
          <Text variant="h2">What's your vibe?</Text>
          <Text variant="body" color={colors.text.secondary}>Tell us about your ideal resort atmosphere</Text>
        </View>

        <View style={styles.sliders}>
          <SliderRow
            label="Crowd Level"
            value={crowdPreference}
            valueLabel={crowdLabel}
            onChange={setCrowdPreference}
            leftLabel="Peaceful"
            rightLabel="Bustling"
            accessibilityLabel="Crowd level preference"
            accessibilityHint="Slide left for peaceful, right for lively"
          />
          <SliderRow
            label="Resort Focus"
            value={familyVsNightlife}
            valueLabel={familyLabel}
            onChange={setFamilyVsNightlife}
            leftLabel="Family-friendly"
            rightLabel="Après-ski"
            accessibilityLabel="Resort focus preference"
            accessibilityHint="Slide left for family, right for nightlife"
          />
          <SliderRow
            label="Snow Reliability"
            value={snowImportance}
            valueLabel={snowLabel}
            onChange={setSnowImportance}
            leftLabel="Not a priority"
            rightLabel="Must have snow"
            accessibilityLabel="Snow reliability importance"
            accessibilityHint="Slide right if snow quality is critical"
          />
        </View>

        <View style={styles.footer}>
          <Button label="Back" variant="secondary" onPress={() => router.back()} style={styles.backBtn} />
          <Button label="See Results" onPress={() => router.push("/(onboarding)/results")} style={styles.nextBtn} size="lg" />
        </View>
      </View>
    </SafeAreaView>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  valueLabel: string;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
  accessibilityLabel: string;
  accessibilityHint: string;
}

function SliderRow({ label, value, valueLabel, onChange, leftLabel, rightLabel, accessibilityLabel, accessibilityHint }: SliderRowProps) {
  return (
    <View style={sliderStyles.section}>
      <View style={sliderStyles.header}>
        <Text variant="h4">{label}</Text>
        <Text variant="bodySmall" color={colors.text.secondary}>{valueLabel}</Text>
      </View>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={1}
        maximumValue={5}
        step={1}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
      <View style={sliderStyles.labels}>
        <Text variant="caption" color={colors.text.tertiary}>{leftLabel}</Text>
        <Text variant="caption" color={colors.text.tertiary}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  tabletCenter: { maxWidth: 680, alignSelf: "center" as const, width: "100%" },
  content: { flex: 1, paddingVertical: spacing.md },
  header: { marginTop: spacing.xl, marginBottom: spacing.xl, gap: spacing.xs },
  sliders: { flex: 1, gap: spacing.xl, justifyContent: "center" },
  footer: { flexDirection: "row", gap: spacing.md, paddingTop: spacing.md },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

const sliderStyles = StyleSheet.create({
  section: { gap: spacing.sm },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  labels: { flexDirection: "row", justifyContent: "space-between" },
});

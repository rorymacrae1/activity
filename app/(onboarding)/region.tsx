import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";

const REGIONS = [
  { id: "france-alps",   name: "French Alps",     flag: "🇫🇷", resorts: 8 },
  { id: "austria",       name: "Austria",         flag: "🇦🇹", resorts: 8 },
  { id: "switzerland",   name: "Switzerland",     flag: "🇨🇭", resorts: 6 },
  { id: "italy",         name: "Italy",           flag: "🇮🇹", resorts: 5 },
  { id: "andorra-spain", name: "Andorra & Spain", flag: "🇦🇩", resorts: 3 },
];

export default function RegionScreen() {
  const { regions, setRegions } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();
  const allSelected = regions.length === REGIONS.length;

  const toggle = (id: string) =>
    setRegions(regions.includes(id) ? regions.filter((r) => r !== id) : [...regions, id]);

  return (
    <QuizLayout scrollable>
      <View style={[styles.inner, { paddingHorizontal: isTablet ? spacing.xl : hPadding }]}>
        <ProgressIndicator current={4} total={5} showLabel />

        <View style={styles.header}>
          <Text variant="h2">{content.onboarding.region.title}</Text>
          <Text variant="body" color={colors.text.secondary}>{content.onboarding.region.subtitle}</Text>
        </View>

        {/* Select all toggle */}
        <Pressable
          style={[styles.selectAll, allSelected && styles.selectAllActive]}
          onPress={() => setRegions(allSelected ? [] : REGIONS.map((r) => r.id))}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: allSelected }}
        >
          <Text variant="bodySmall" color={allSelected ? colors.primary : colors.text.secondary}
            style={allSelected ? styles.selectAllActiveText : undefined}>
            {allSelected ? `✓ ${content.onboarding.region.allSelected}` : content.onboarding.region.selectAll}
          </Text>
        </Pressable>

        {/* Region list — 2 cols on tablet */}
        <View style={[styles.grid, isTablet && styles.gridTablet]}>
          {REGIONS.map((region) => {
            const selected = regions.includes(region.id);
            return (
              <Pressable
                key={region.id}
                style={[styles.option, selected && styles.optionActive, isTablet && styles.optionTablet]}
                onPress={() => toggle(region.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${region.name}, ${region.resorts} resorts`}
              >
                <Text style={styles.flag}>{region.flag}</Text>
                <View style={styles.optionText}>
                  <Text variant="h4" color={selected ? colors.primary : colors.text.primary}>{region.name}</Text>
                  <Text variant="caption" color={colors.text.tertiary}>{region.resorts} resorts</Text>
                </View>
                <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                  {selected ? <Text style={styles.check}>✓</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button label={`← ${content.onboarding.region.back}`} variant="ghost" onPress={() => router.back()} style={styles.backBtn} />
          <Button label={`${content.onboarding.region.next} →`} onPress={() => regions.length > 0 && router.push("/(onboarding)/vibes")} disabled={regions.length === 0} style={styles.nextBtn} size="prominent" />
        </View>
      </View>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  inner: { paddingVertical: spacing.md },
  header: { marginTop: spacing.md, marginBottom: spacing.md, gap: spacing.xs },
  selectAll: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: "dashed",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  selectAllActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle, borderStyle: "solid" },
  selectAllActiveText: { fontWeight: "600" },
  grid: { gap: spacing.sm },
  gridTablet: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.background.secondary,
    gap: spacing.md,
  },
  optionTablet: { width: "47%" },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  flag: { fontSize: 28 },
  optionText: { flex: 1 },
  checkbox: {
    width: 24, height: 24,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: colors.text.inverse, fontSize: 13, fontWeight: "bold" },
  footer: { flexDirection: "row", gap: spacing.sm, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

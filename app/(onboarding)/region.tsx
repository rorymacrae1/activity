import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { usePreferencesStore } from "@/stores/preferences";
import { useLayout } from "@/hooks/useLayout";
import { colors, spacing, radius } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";

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
  const allSelected = regions.length === REGIONS.length;

  const toggle = (id: string) =>
    setRegions(regions.includes(id) ? regions.filter((r) => r !== id) : [...regions, id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: hPadding }, isTablet && styles.tabletCenter]}>
        <ProgressIndicator current={3} total={5} />

        <View style={styles.header}>
          <Text variant="h2">Where do you want to ski?</Text>
          <Text variant="body" color={colors.text.secondary}>Select one or more regions</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Select all */}
          <Pressable
            style={[styles.selectAll, allSelected && styles.selectAllActive]}
            onPress={() => setRegions(allSelected ? [] : REGIONS.map((r) => r.id))}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: allSelected }}
          >
            <Text variant="bodySmall" color={allSelected ? colors.primary : colors.text.secondary}
              style={allSelected ? styles.selectAllActiveText : undefined}>
              {allSelected ? "✓ All regions selected" : "Select all regions"}
            </Text>
          </Pressable>

          {/* Region grid — 2 cols on tablet */}
          <View style={[styles.optionGrid, isTablet && styles.optionGridTablet]}>
            {REGIONS.map((region) => {
              const selected = regions.includes(region.id);
              return (
                <Pressable
                  key={region.id}
                  style={[styles.option, selected && styles.optionSelected, isTablet && styles.optionTablet]}
                  onPress={() => toggle(region.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${region.name}, ${region.resorts} resorts`}
                >
                  <Text style={styles.optionFlag}>{region.flag}</Text>
                  <View style={styles.optionText}>
                    <Text variant="h4" color={selected ? colors.primary : colors.text.primary}>{region.name}</Text>
                    <Text variant="caption" color={colors.text.tertiary}>{region.resorts} resorts</Text>
                  </View>
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    {selected ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Back" variant="secondary" onPress={() => router.back()} style={styles.backBtn} />
          <Button label="Next" onPress={() => regions.length > 0 && router.push("/(onboarding)/vibes")} disabled={regions.length === 0} style={styles.nextBtn} size="lg" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  tabletCenter: { maxWidth: 680, alignSelf: "center" as const, width: "100%" },
  content: { flex: 1, paddingVertical: spacing.md },
  header: { marginTop: spacing.xl, marginBottom: spacing.lg, gap: spacing.xs },
  scroll: { flex: 1 },
  selectAll: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  selectAllActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle, borderStyle: "solid" },
  selectAllActiveText: { fontWeight: "600" },
  optionGrid: { gap: spacing.sm },
  optionGridTablet: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
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
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  optionFlag: { fontSize: 28 },
  optionText: { flex: 1 },
  checkbox: {
    width: 24, height: 24,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: colors.text.inverse, fontSize: 14, fontWeight: "bold" },
  footer: { flexDirection: "row", gap: spacing.md, paddingTop: spacing.md },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});

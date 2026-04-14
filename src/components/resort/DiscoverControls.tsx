/**
 * DiscoverControls
 *
 * Compact horizontal bar of segmented controls for the Discover scatter plot.
 * Each control maps to a dimension of NormalizedPreferences; changing any
 * value re-scores and re-projects all resorts without a reload.
 */

import { useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import type { NormalizedPreferences } from "@/types/preferences";
import { Text } from "@components/ui/Text";
import { colors, spacing, radius } from "@theme";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiscoverPrefs = Pick<
  NormalizedPreferences,
  | "minSkill"
  | "maxSkill"
  | "budgetLevel"
  | "quietLively"
  | "familyNightlife"
  | "snowImportance"
>;

interface DiscoverControlsProps {
  value: DiscoverPrefs;
  onChange: (next: DiscoverPrefs) => void;
}

// ─── Segment data ─────────────────────────────────────────────────────────────

const SKILL_OPTS = [
  { label: "Beginner", min: 0, max: 0 },
  { label: "Inter.", min: 0.33, max: 0.33 },
  { label: "Red", min: 0.67, max: 0.67 },
  { label: "Advanced", min: 1, max: 1 },
] as const;

const BUDGET_OPTS = [
  { label: "Budget", val: 0 },
  { label: "Mid", val: 0.33 },
  { label: "Premium", val: 0.67 },
  { label: "Luxury", val: 1 },
] as const;

const SNOW_OPTS = [
  { label: "Low", val: 0 },
  { label: "Med", val: 0.5 },
  { label: "High", val: 1 },
] as const;

const VIBE_OPTS = [
  { label: "Quiet", val: 0 },
  { label: "Lively", val: 1 },
] as const;

const FAMILY_OPTS = [
  { label: "Family", val: 0 },
  { label: "Nightlife", val: 1 },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SegGroupProps<T> {
  label: string;
  options: readonly { label: string; val: T }[];
  selected: T;
  onSelect: (val: T) => void;
}

function SegGroup<T extends number>({
  label,
  options,
  selected,
  onSelect,
}: SegGroupProps<T>) {
  return (
    <View style={seg.group}>
      <Text style={seg.groupLabel}>{label}</Text>
      <View style={seg.row}>
        {options.map((opt) => {
          const active = Math.abs(opt.val - selected) < 0.01;
          return (
            <Pressable
              key={opt.label}
              onPress={() => onSelect(opt.val)}
              style={[seg.btn, active && seg.btnActive]}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${opt.label}`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[seg.btnText, active && seg.btnTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Compact preference controls that feed the scatter plot.
 * Displayed as a horizontally scrollable row of segmented pickers.
 */
export function DiscoverControls({ value, onChange }: DiscoverControlsProps) {
  const set = useCallback(
    (patch: Partial<DiscoverPrefs>) => onChange({ ...value, ...patch }),
    [value, onChange],
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Skill */}
        <SegGroup
          label="Skill"
          options={SKILL_OPTS.map((o) => ({ label: o.label, val: o.max }))}
          selected={value.maxSkill}
          onSelect={(val) => set({ minSkill: val, maxSkill: val })}
        />

        <View style={styles.divider} />

        {/* Budget */}
        <SegGroup
          label="Budget"
          options={BUDGET_OPTS}
          selected={value.budgetLevel}
          onSelect={(val) => set({ budgetLevel: val })}
        />

        <View style={styles.divider} />

        {/* Snow */}
        <SegGroup
          label="Snow"
          options={SNOW_OPTS}
          selected={value.snowImportance}
          onSelect={(val) => set({ snowImportance: val })}
        />

        <View style={styles.divider} />

        {/* Vibe */}
        <SegGroup
          label="Vibe"
          options={VIBE_OPTS}
          selected={value.quietLively}
          onSelect={(val) => set({ quietLively: val })}
        />

        <View style={styles.divider} />

        {/* Scene */}
        <SegGroup
          label="Scene"
          options={FAMILY_OPTS}
          selected={value.familyNightlife}
          onSelect={(val) => set({ familyNightlife: val })}
        />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    backgroundColor: colors.surface.primary,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.xs,
  },
});

const seg = StyleSheet.create({
  group: {
    gap: 4,
    alignItems: "center",
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.ink.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    backgroundColor: colors.canvas.muted,
    borderRadius: radius.sm,
    padding: 2,
    gap: 1,
  },
  btn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  btnActive: {
    backgroundColor: colors.surface.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  btnText: {
    fontSize: 12,
    color: colors.ink.muted,
    fontWeight: "500",
  },
  btnTextActive: {
    color: colors.ink.rich,
    fontWeight: "700",
  },
});

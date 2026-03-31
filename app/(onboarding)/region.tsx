import { View, StyleSheet, Pressable, Platform } from "react-native";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Organized by region for future filtering/grouping */
const REGIONS = [
  // Europe
  {
    id: "france-alps",
    name: "French Alps",
    flag: "🇫🇷",
    resorts: 8,
    continent: "europe",
  },
  {
    id: "austria",
    name: "Austria",
    flag: "🇦🇹",
    resorts: 8,
    continent: "europe",
  },
  {
    id: "switzerland",
    name: "Switzerland",
    flag: "🇨🇭",
    resorts: 6,
    continent: "europe",
  },
  { id: "italy", name: "Italy", flag: "🇮🇹", resorts: 5, continent: "europe" },
  {
    id: "andorra-spain",
    name: "Andorra & Spain",
    flag: "🇦🇩",
    resorts: 3,
    continent: "europe",
  },
  // North America
  {
    id: "usa-colorado",
    name: "Colorado",
    flag: "🇺🇸",
    resorts: 0,
    continent: "north-america",
  },
  {
    id: "usa-utah",
    name: "Utah",
    flag: "🇺🇸",
    resorts: 0,
    continent: "north-america",
  },
  {
    id: "canada-bc",
    name: "British Columbia",
    flag: "🇨🇦",
    resorts: 0,
    continent: "north-america",
  },
  // Asia
  { id: "japan", name: "Japan", flag: "🇯🇵", resorts: 0, continent: "asia" },
  // Scandinavia
  { id: "norway", name: "Norway", flag: "🇳🇴", resorts: 1, continent: "europe" },
];

/** Currently available regions (resorts > 0) */
const AVAILABLE_REGIONS = REGIONS.filter((r) => r.resorts > 0);

/**
 * Flag display component.
 */
function FlagBadge({ flag, selected }: { flag: string; selected: boolean }) {
  return (
    <View
      style={[flagStyles.container, selected && flagStyles.containerActive]}
    >
      <Text style={flagStyles.flag}>{flag}</Text>
    </View>
  );
}

const flagStyles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.canvas.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  containerActive: {
    backgroundColor: colors.brand.primarySubtle,
  },
  flag: {
    fontSize: 24,
  },
});

/**
 * Animated region card with press feedback and luxury styling.
 */
function RegionCard({
  region,
  selected,
  onToggle,
  isTablet,
}: {
  region: (typeof AVAILABLE_REGIONS)[0];
  selected: boolean;
  onToggle: () => void;
  isTablet: boolean;
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
    onToggle();
  };

  return (
    <AnimatedPressable
      style={[
        styles.regionCard,
        selected && styles.regionCardActive,
        isTablet && styles.regionCardTablet,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${region.name}, ${region.resorts} resorts`}
    >
      {/* Flag */}
      <FlagBadge flag={region.flag} selected={selected} />

      {/* Region info */}
      <View style={styles.regionInfo}>
        <Text
          variant="h4"
          color={selected ? colors.brand.primary : colors.ink.rich}
        >
          {region.name}
        </Text>
        <Text variant="caption" color={colors.ink.muted}>
          {region.resorts} resorts
        </Text>
      </View>

      {/* Selection indicator */}
      <View style={[styles.checkbox, selected && styles.checkboxActive]}>
        {selected && <Text style={styles.checkIcon}>✓</Text>}
      </View>
    </AnimatedPressable>
  );
}

export default function RegionScreen() {
  const { regions, setRegions } = usePreferencesStore();
  const { isTablet, hPadding, layoutMode } = useLayout();
  const content = useContent();
  const allSelected = regions.length === AVAILABLE_REGIONS.length;

  const toggle = (id: string) =>
    setRegions(
      regions.includes(id) ? regions.filter((r) => r !== id) : [...regions, id],
    );

  const handleSelectAll = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setRegions(allSelected ? [] : AVAILABLE_REGIONS.map((r) => r.id));
  };

  return (
    <QuizLayout
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label={`← ${content.onboarding.region.back}`}
            variant="ghost"
            onPress={() => router.back()}
            style={styles.backBtn}
          />
          <Button
            label={`${content.onboarding.region.next} →`}
            onPress={() =>
              regions.length > 0 && router.push("/(onboarding)/vibes")
            }
            disabled={regions.length === 0}
            style={styles.nextBtn}
            size="prominent"
          />
        </View>
      }
    >
      <View
        style={[styles.inner, !isTablet && { paddingHorizontal: hPadding }]}
      >
        <ProgressIndicator current={4} total={5} showLabel />

        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2">{content.onboarding.region.title}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {content.onboarding.region.subtitle}
          </Text>
        </View>

        {/* Select all toggle */}
        <Pressable
          style={[styles.selectAll, allSelected && styles.selectAllActive]}
          onPress={handleSelectAll}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: allSelected }}
        >
          <View
            style={[
              styles.selectAllCheck,
              allSelected && styles.selectAllCheckActive,
            ]}
          >
            {allSelected ? (
              <Text style={styles.selectAllCheckIcon}>✓</Text>
            ) : null}
          </View>
          <Text
            variant="bodyMedium"
            color={allSelected ? colors.brand.primary : colors.ink.normal}
          >
            {allSelected
              ? content.onboarding.region.allSelected
              : content.onboarding.region.selectAll}
          </Text>
        </Pressable>

        {/* Region grid — 2 cols on tablet */}
        <View style={[styles.grid, isTablet && styles.gridTablet]}>
          {AVAILABLE_REGIONS.map((region) => (
            <RegionCard
              key={region.id}
              region={region}
              selected={regions.includes(region.id)}
              onToggle={() => toggle(region.id)}
              isTablet={isTablet}
            />
          ))}
        </View>
      </View>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },

  // Select all
  selectAll: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
    backgroundColor: colors.surface.primary,
    gap: spacing.sm,
    alignSelf: "flex-start",
    // Shadow for consistency
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  selectAllActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySubtle,
  },
  selectAllCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.primary,
  },
  selectAllCheckActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  selectAllCheckIcon: {
    color: colors.ink.onBrand,
    fontSize: 11,
    fontWeight: "700",
  },

  // Grid
  grid: {
    gap: spacing.sm,
  },
  gridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: spacing.md,
  },

  // Region card
  regionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    gap: spacing.sm,
    // Multi-layer shadow (native)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  regionCardTablet: {
    width: "47%",
    minWidth: 220,
    maxWidth: 280,
    padding: spacing.md,
  },
  regionCardActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySubtle,
    shadowOpacity: 0.15,
  },

  // Region info
  regionInfo: {
    flex: 1,
    gap: 2,
  },

  // Checkbox
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.primary,
  },
  checkboxActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
    // Subtle glow
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  checkIcon: {
    color: colors.ink.onBrand,
    fontSize: 13,
    fontWeight: "700",
  },

  // Footer
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

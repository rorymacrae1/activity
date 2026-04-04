import { View, StyleSheet, Pressable, Platform, Image } from "react-native";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Text } from "./Text";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius, shadows } from "@theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Features that are coming soon — shown in dropdown */
const COMING_SOON = [
  { id: "weather", label: "Live Weather", icon: "🌨️" },
  { id: "social", label: "Trip Planning", icon: "👥" },
  { id: "deals", label: "Lift Pass Deals", icon: "🎫" },
  { id: "reviews", label: "Community Reviews", icon: "⭐" },
];

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoImage = require("../../../assets/Piste Wise logo with mountain icon.png");

/**
 * PisteWise logo component — uses actual logo image
 */
function Logo() {
  return (
    <Image
      source={logoImage}
      style={logoStyles.image}
      resizeMode="contain"
      accessibilityLabel="PisteWise logo"
    />
  );
}

const logoStyles = StyleSheet.create({
  image: {
    width: 140,
    height: 40,
  },
});

/**
 * Coming Soon dropdown button
 */
function ComingSoonButton() {
  const [open, setOpen] = useState(false);
  const dropdownHeight = useSharedValue(0);
  const rotation = useSharedValue(0);

  const toggleDropdown = () => {
    setOpen(!open);
    dropdownHeight.value = withSpring(open ? 0 : 1, { damping: 15 });
    rotation.value = withTiming(open ? 0 : 180, { duration: 200 });
  };

  const dropdownStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dropdownHeight.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(dropdownHeight.value, [0, 1], [-8, 0]) },
      { scale: interpolate(dropdownHeight.value, [0, 1], [0.95, 1]) },
    ],
    pointerEvents: dropdownHeight.value > 0.5 ? "auto" : "none",
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={comingSoonStyles.wrapper}>
      <Pressable
        style={comingSoonStyles.button}
        onPress={toggleDropdown}
        accessibilityRole="button"
        accessibilityLabel="Coming soon features"
        accessibilityState={{ expanded: open }}
      >
        <View style={comingSoonStyles.badge}>
          <Text style={comingSoonStyles.badgeText}>Soon</Text>
        </View>
        <Text style={comingSoonStyles.label}>Coming</Text>
        <Animated.Text style={[comingSoonStyles.chevron, chevronStyle]}>
          ▼
        </Animated.Text>
      </Pressable>

      {/* Dropdown */}
      <Animated.View style={[comingSoonStyles.dropdown, dropdownStyle]}>
        {COMING_SOON.map((feature) => (
          <View key={feature.id} style={comingSoonStyles.feature}>
            <Text style={comingSoonStyles.featureIcon}>{feature.icon}</Text>
            <Text style={comingSoonStyles.featureLabel}>{feature.label}</Text>
          </View>
        ))}
        <Text style={comingSoonStyles.hint}>Stay tuned!</Text>
      </Animated.View>
    </View>
  );
}

const comingSoonStyles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.accentSubtle,
  },
  badge: {
    backgroundColor: colors.brand.accent,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.ink.rich,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink.normal,
  },
  chevron: {
    fontSize: 8,
    color: colors.ink.muted,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: spacing.xs,
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    padding: spacing.sm,
    minWidth: 180,
    ...shadows.floating,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    zIndex: 100,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureLabel: {
    fontSize: 14,
    color: colors.ink.normal,
  },
  hint: {
    fontSize: 11,
    color: colors.ink.muted,
    textAlign: "center",
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});

interface NavHeaderProps {
  /** Show the coming soon indicator */
  showComingSoon?: boolean;
  /** Optional right-side content */
  rightContent?: React.ReactNode;
}

/**
 * App navigation header with PisteWise branding.
 *
 * @example
 * <NavHeader showComingSoon />
 */
export function NavHeader({
  showComingSoon = true,
  rightContent,
}: NavHeaderProps) {
  const { hPadding, isWeb } = useLayout();

  return (
    <View
      style={[
        styles.header,
        { paddingHorizontal: hPadding },
        isWeb && styles.headerWeb,
      ]}
    >
      <Logo />
      <View style={styles.right}>
        {showComingSoon && <ComingSoonButton />}
        {rightContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    backgroundColor: colors.canvas.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerWeb: {
    paddingVertical: spacing.lg,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});

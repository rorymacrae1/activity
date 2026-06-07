import { View, Pressable, Image } from "react-native";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";
import { useLayout } from "@hooks/useLayout";
import { colors, spacing, radius, shadows } from "@theme";

const _AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Features that are coming soon — shown in dropdown */
const COMING_SOON: { id: string; label: string; icon: IconName }[] = [
  { id: "weather", label: "Live Weather", icon: "cloud-snow" },
  { id: "social", label: "Trip Planning", icon: "users" },
  { id: "deals", label: "Lift Pass Deals", icon: "ticket" },
  { id: "reviews", label: "Community Reviews", icon: "star" },
];

const logoImage = require("../../../assets/Piste Wise logo with mountain icon.png");

/**
 * PisteWise logo component — uses actual logo image
 */
function Logo() {
  return (
    <Image
      source={logoImage}
      style={{ width: 140, height: 40 }}
      resizeMode="contain"
      accessibilityLabel="PisteWise logo"
    />
  );
}

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
    <View style={{ position: "relative" }}>
      <Pressable
        className="flex-row items-center gap-1 py-1 px-2 rounded-lg"
        style={{ backgroundColor: colors.brand.accentSubtle }}
        onPress={toggleDropdown}
        accessibilityRole="button"
        accessibilityLabel="Coming soon features"
        accessibilityState={{ expanded: open }}
      >
        <View
          className="px-1 py-0.5 rounded"
          style={{ backgroundColor: colors.brand.accent }}
        >
          <Text style={{ fontSize: 10, fontWeight: "700", color: colors.ink.rich, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Soon
          </Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink.normal }}>
          Coming
        </Text>
        <Animated.Text style={[{ fontSize: 8, color: colors.ink.muted }, chevronStyle]}>
          ▼
        </Animated.Text>
      </Pressable>

      {/* Dropdown */}
      <Animated.View
        style={[
          {
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
          dropdownStyle,
        ]}
      >
        {COMING_SOON.map((feature) => (
          <View
            key={feature.id}
            className="flex-row items-center gap-2 py-1 px-1"
          >
            <Icon
              name={feature.icon}
              size={16}
              color={colors.ink.muted}
              strokeWidth={1.5}
            />
            <Text style={{ fontSize: 14, color: colors.ink.normal }}>
              {feature.label}
            </Text>
          </View>
        ))}
        <Text
          style={{
            fontSize: 11,
            color: colors.ink.muted,
            textAlign: "center",
            marginTop: spacing.xs,
            paddingTop: spacing.xs,
            borderTopWidth: 1,
            borderTopColor: colors.border.subtle,
          }}
        >
          Stay tuned!
        </Text>
      </Animated.View>
    </View>
  );
}

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
      className="flex-row items-center justify-between border-b"
      style={{
        paddingHorizontal: hPadding,
        paddingVertical: isWeb ? spacing.lg : spacing.md,
        backgroundColor: colors.canvas.default,
        borderBottomColor: colors.border.subtle,
      }}
    >
      <Logo />
      <View className="flex-row items-center gap-3">
        {showComingSoon && <ComingSoonButton />}
        {rightContent}
      </View>
    </View>
  );
}

/**
 * SideNav — Desktop web sidebar navigation.
 * Renders at ≥1280px (showSideNav from useLayout).
 * Replaces the bottom tab bar on large screens.
 */

import { View, Pressable, Platform } from "react-native";
import { useState } from "react";
import { usePathname, router } from "expo-router";
import { useIsAuthenticated } from "@stores/auth";
import { colors, spacing, radius } from "@theme";
import { webStyles } from "@theme/interaction";
import { Text } from "./Text";
import { Icon, type IconName } from "./Icon";

interface NavItem {
  icon: IconName;
  label: string;
  href: string;
  /** Pathname prefix that marks this item active */
  matchPrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: "home", label: "Home", href: "/", matchPrefix: undefined },
  { icon: "search", label: "Discover", href: "/discover", matchPrefix: "/discover" },
  { icon: "heart", label: "Saved", href: "/favorites", matchPrefix: "/favorites" },
  { icon: "user", label: "Profile", href: "/profile", matchPrefix: "/profile" },
];

export function SideNav() {
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();

  const isActive = (item: NavItem) => {
    if (item.matchPrefix) return pathname.startsWith(item.matchPrefix);
    return pathname === "/" || pathname === "";
  };

  return (
    <View
      className="h-full py-5 flex-shrink-0"
      style={{
        width: 240,
        backgroundColor: colors.surface.primary,
        borderRightWidth: 1,
        borderRightColor: colors.border.subtle,
      }}
    >
      {/* Brand */}
      <View className="flex-row items-center gap-2 px-5 mb-5">
        <View
          className="w-9 h-9 items-center justify-center"
          style={{
            borderRadius: radius.sm,
            backgroundColor: colors.brand.primarySubtle,
          }}
        >
          <Icon
            name="mountain"
            size={22}
            color={colors.brand.primary}
            strokeWidth={2}
          />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "700", color: colors.ink.rich, letterSpacing: -0.3 }}>
          PeakWise
        </Text>
      </View>

      {/* Nav items */}
      <View className="flex-1 px-2" style={{ gap: spacing.xxs }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <NavItemButton key={item.href} item={item} active={active} />
          );
        })}
      </View>

      {/* Bottom: Auth CTA if not signed in */}
      {!isAuthenticated && (
        <View
          className="px-2 pt-4 mx-2"
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border.subtle,
          }}
        >
          <Pressable
            className="flex-row items-center justify-center gap-2 py-2 px-5"
            style={[{ backgroundColor: colors.brand.primary, borderRadius: radius.md }, webStyles.clickable]}
            onPress={() => router.push("/(auth)/sign-in")}
            accessibilityRole="button"
          >
            <Icon name="log-in" size={16} color={colors.ink.inverse} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.ink.inverse }}>
              Sign In
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function NavItemButton({ item, active }: { item: NavItem; active: boolean }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Pressable
      className="flex-row items-center gap-3 py-2 px-3 relative"
      style={({ pressed }) => [
        { borderRadius: radius.md },
        active && { backgroundColor: colors.brand.primarySubtle },
        pressed && { opacity: 0.75 },
        webStyles.clickable,
        isFocused && Platform.OS === "web" && webStyles.focusVisible,
      ]}
      onPress={() => router.push(item.href as Parameters<typeof router.push>[0])}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      accessibilityRole="link"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
    >
      <Icon
        name={item.icon}
        size={20}
        color={active ? colors.brand.primary : colors.ink.muted}
        strokeWidth={active ? 2 : 1.5}
      />
      <Text
        className="flex-1"
        style={{
          fontSize: 15,
          fontWeight: active ? "600" : "400",
          color: active ? colors.brand.primary : colors.ink.normal,
        }}
      >
        {item.label}
      </Text>
      {active && (
        <View
          className="w-1 h-1"
          style={{
            borderRadius: radius.full,
            backgroundColor: colors.brand.primary,
          }}
        />
      )}
    </Pressable>
  );
}

/**
 * SideNav — Desktop web sidebar navigation.
 * Renders at ≥1280px (showSideNav from useLayout).
 * Replaces the bottom tab bar on large screens.
 */

import { View, StyleSheet, Pressable } from "react-native";
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
    // Home is active only at root
    return pathname === "/" || pathname === "";
  };

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.logoMark}>
          <Icon
            name="mountain"
            size={22}
            color={colors.brand.primary}
            strokeWidth={2}
          />
        </View>
        <Text style={styles.brandName}>PeakWise</Text>
      </View>

      {/* Nav items */}
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Pressable
              key={item.href}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && styles.navItemPressed,
                webStyles.clickable,
              ]}
              onPress={() => router.push(item.href as Parameters<typeof router.push>[0])}
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
                style={[
                  styles.navLabel,
                  active ? styles.navLabelActive : styles.navLabelInactive,
                ]}
              >
                {item.label}
              </Text>
              {active && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>

      {/* Bottom: Auth CTA if not signed in */}
      {!isAuthenticated && (
        <View style={styles.bottomSection}>
          <Pressable
            style={[styles.signInButton, webStyles.clickable]}
            onPress={() => router.push("/(auth)/sign-in")}
            accessibilityRole="button"
          >
            <Icon name="log-in" size={16} color={colors.ink.inverse} />
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: "100%",
    backgroundColor: colors.surface.primary,
    borderRightWidth: 1,
    borderRightColor: colors.border.subtle,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    flexShrink: 0,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink.rich,
    letterSpacing: -0.3,
  },
  nav: {
    flex: 1,
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    position: "relative",
  },
  navItemActive: {
    backgroundColor: colors.brand.primarySubtle,
  },
  navItemPressed: {
    opacity: 0.75,
  },
  navLabel: {
    fontSize: 15,
    flex: 1,
  },
  navLabelActive: {
    fontWeight: "600",
    color: colors.brand.primary,
  },
  navLabelInactive: {
    fontWeight: "400",
    color: colors.ink.normal,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primary,
  },
  bottomSection: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    marginHorizontal: spacing.sm,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
  },
  signInText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink.inverse,
  },
});

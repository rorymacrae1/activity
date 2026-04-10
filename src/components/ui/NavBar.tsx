/**
 * Shared navigation bar with logo and auth-aware right section.
 * Shows "Sign In" for guests, "Hi {firstName}" with avatar for authenticated users.
 */

import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { useAuthStore, useProfile, useIsAuthenticated } from "@stores/auth";
import { colors, spacing, radius } from "@theme";
import { Text } from "./Text";

interface NavBarProps {
  /** Whether to use transparent background (for overlay on images) */
  transparent?: boolean;
}

export function NavBar({ transparent = false }: NavBarProps) {
  const { user } = useAuthStore();
  const profile = useProfile();
  const isAuthenticated = useIsAuthenticated();

  // Get first name from profile or email
  const firstName =
    profile?.display_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  return (
    <View style={[styles.navBar, transparent && styles.transparent]}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>⛷️</Text>
      </View>

      <View style={styles.navRight}>
        {isAuthenticated ? (
          <Pressable
            style={styles.userButton}
            onPress={() => router.push("/(main)/profile")}
            accessibilityRole="button"
            accessibilityLabel="Go to profile"
          >
            <Text style={styles.userGreeting}>Hi {firstName}</Text>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            style={styles.signInButton}
            onPress={() => router.push("/(auth)/sign-in")}
            accessibilityRole="button"
            accessibilityLabel="Sign in or sign up"
          >
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  transparent: {
    backgroundColor: colors.transparent,
    borderBottomWidth: 0,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.primary,
  },
  logo: {
    fontSize: 20,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface.secondary,
  },
  userGreeting: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  signInButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  signInText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.inverse,
  },
});

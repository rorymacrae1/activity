/**
 * Shared navigation bar with logo and auth-aware right section.
 * Shows "Sign In" for guests, "Hi {firstName}" with avatar for authenticated users.
 */

import { View, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { useAuthStore, useProfile, useIsAuthenticated } from "@stores/auth";
import { colors, radius } from "@theme";
import { webStyles } from "@theme/interaction";
import { Text } from "./Text";
import { Icon } from "./Icon";

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
    <View
      className="flex-row justify-between items-center py-2 px-5 border-b border-b-[#E8E8E8]"
      style={{
        backgroundColor: transparent ? colors.transparent : colors.surface.primary,
        borderBottomWidth: transparent ? 0 : 1,
      }}
    >
      <View
        className="w-10 h-10 rounded-full border-2 items-center justify-center"
        style={{
          borderColor: colors.border.default,
          backgroundColor: colors.surface.primary,
        }}
      >
        <Icon
          name="mountain"
          size={24}
          color={colors.brand.primary}
          strokeWidth={2}
        />
      </View>

      <View className="flex-row items-center">
        {isAuthenticated ? (
          <Pressable
            className="flex-row items-center gap-2 py-1 px-2 rounded-full"
            style={[
              { backgroundColor: colors.surface.secondary },
              Platform.OS === "web" && webStyles.clickable,
            ]}
            onPress={() => router.push("/(main)/profile")}
            accessibilityRole="button"
            accessibilityLabel="Go to profile"
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.ink.rich }}>
              Hi {firstName}
            </Text>
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.brand.primary }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.ink.inverse }}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            className="py-2 px-5 rounded-full"
            style={[
              { backgroundColor: colors.brand.primary },
              Platform.OS === "web" && webStyles.clickable,
            ]}
            onPress={() => router.push("/(auth)/sign-in")}
            accessibilityRole="button"
            accessibilityLabel="Sign in or sign up"
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.ink.inverse }}>
              Sign In
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/**
 * QuickActions - Grid of quick action buttons for easy navigation
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";

interface QuickAction {
  id: string;
  icon: IconName;
  iconColor: string;
  label: string;
  sublabel?: string;
  route: string;
  accentColor?: string;
}

interface QuickActionsProps {
  showCompleteProfile?: boolean;
}

export function QuickActions({
  showCompleteProfile = false,
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: "browse",
      icon: "mountain",
      iconColor: colors.brand.primary,
      label: "Browse Resorts",
      sublabel: "Discover your next trip",
      route: "/(onboarding)/results",
      accentColor: colors.brand.primarySubtle,
    },
    {
      id: "quiz",
      icon: "target",
      iconColor: colors.sentiment.warning,
      label: "Retake Quiz",
      sublabel: "Update your preferences",
      route: "/(onboarding)",
      accentColor: colors.sentiment.warningSubtle,
    },
  ];

  // Add profile completion action if needed
  if (showCompleteProfile) {
    actions.push({
      id: "profile",
      icon: "sparkles",
      iconColor: colors.sentiment.success,
      label: "Complete Profile",
      sublabel: "Better recommendations",
      route: "/(main)/complete-profile",
      accentColor: colors.sentiment.successSubtle,
    });
  }

  const handlePress = (action: QuickAction) => {
    router.push(action.route as never);
  };

  return (
    <View style={styles.container}>
      <Text variant="h3" style={styles.heading}>
        Quick Actions
      </Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: action.accentColor },
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => handlePress(action)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <View style={styles.iconContainer}>
              <Icon
                name={action.icon}
                size={28}
                color={action.iconColor}
                strokeWidth={1.5}
              />
            </View>
            <Text style={styles.label}>{action.label}</Text>
            {action.sublabel && (
              <Text style={styles.sublabel}>{action.sublabel}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  heading: {
    marginBottom: spacing.md,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: 140,
    maxWidth: 200,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "flex-start",
    ...shadows.sm,
  },
  actionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  sublabel: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

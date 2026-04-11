/**
 * ProfileCompletionCard
 * Prompts users to complete their profile for personalized recommendations
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";

interface ProfileCompletionCardProps {
  /** Completion percentage (0-100) */
  completionPercentage: number;
  /** Missing items to highlight */
  missing: {
    homeAirport?: boolean;
    visitedResorts?: boolean;
    favorites?: boolean;
  };
}

/**
 * Card that prompts users to complete their profile.
 * Shows progress and highlights what's missing.
 */
export function ProfileCompletionCard({
  completionPercentage,
  missing,
}: ProfileCompletionCardProps) {
  const handlePress = () => {
    router.push("/(main)/complete-profile");
  };

  return (
    <Pressable onPress={handlePress} accessibilityRole="button">
      <Card elevation="elevated" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Icon
              name="sparkles"
              size={28}
              color={colors.brand.primary}
              strokeWidth={1.5}
            />
          </View>
          <View style={styles.headerText}>
            <Text variant="h3" style={styles.title}>
              Let's Personalise Your Experience
            </Text>
            <Text variant="body" color={colors.text.secondary}>
              Help us find your perfect resorts
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionPercentage}%` },
              ]}
            />
          </View>
          <Text variant="caption" color={colors.text.tertiary}>
            {completionPercentage}% complete
          </Text>
        </View>

        {/* Missing items */}
        <View style={styles.missingItems}>
          {missing.visitedResorts && (
            <View style={styles.missingItem}>
              <Icon
                name="mountain"
                size={16}
                color={colors.text.secondary}
                strokeWidth={1.5}
              />
              <Text variant="caption" color={colors.text.secondary}>
                Add resorts you've visited
              </Text>
            </View>
          )}
          {missing.homeAirport && (
            <View style={styles.missingItem}>
              <Icon
                name="plane"
                size={16}
                color={colors.text.secondary}
                strokeWidth={1.5}
              />
              <Text variant="caption" color={colors.text.secondary}>
                Set your home airport
              </Text>
            </View>
          )}
          {missing.favorites && (
            <View style={styles.missingItem}>
              <Icon
                name="heart"
                size={16}
                color={colors.text.secondary}
                strokeWidth={1.5}
              />
              <Text variant="caption" color={colors.text.secondary}>
                Save resorts you love
              </Text>
            </View>
          )}
        </View>

        <Button
          label="Complete Profile"
          onPress={handlePress}
          fullWidth
          style={styles.button}
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    color: colors.text.primary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  missingItems: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  missingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  button: {
    marginTop: spacing.xs,
  },
});

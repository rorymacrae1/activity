/**
 * WelcomeHero - Personalized greeting with quick stats
 * Premium alpine-inspired design with time-aware greeting
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/ui/Text";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";

interface WelcomeHeroProps {
  firstName: string;
  favoritesCount: number;
  profileComplete: boolean;
}

/**
 * Get time-appropriate greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Get current ski season status with appropriate icon
 */
function getSeasonStatus(): { icon: IconName; message: string } {
  const month = new Date().getMonth();
  // Northern hemisphere ski season: Nov-Apr
  if (month >= 10 || month <= 3) {
    return { icon: "snowflake", message: "Ski season is on!" };
  }
  if (month >= 4 && month <= 5) {
    return { icon: "snowflake", message: "Spring skiing available" };
  }
  return { icon: "compass", message: "Planning ahead?" };
}

export function WelcomeHero({
  firstName,
  favoritesCount,
  profileComplete,
}: WelcomeHeroProps) {
  const greeting = getGreeting();
  const season = getSeasonStatus();

  return (
    <LinearGradient
      colors={[colors.canvas.inverse, colors.cta.secondaryHover]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative snow dots */}
      <View style={styles.snowDecor}>
        <View style={[styles.snowDot, styles.dot1]} />
        <View style={[styles.snowDot, styles.dot2]} />
        <View style={[styles.snowDot, styles.dot3]} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{firstName}</Text>

        <View style={styles.seasonBadge}>
          <Icon
            name={season.icon}
            size={14}
            color={colors.onDark.text.secondary}
            strokeWidth={2}
          />
          <Text style={styles.seasonText}>{season.message}</Text>
        </View>
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{favoritesCount}</Text>
          <Text style={styles.statLabel}>
            {favoritesCount === 1 ? "Favorite" : "Favorites"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profileComplete ? "100%" : "60%"}
          </Text>
          <Text style={styles.statLabel}>Profile</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: "hidden",
    position: "relative",
  },
  snowDecor: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  snowDot: {
    position: "absolute",
    backgroundColor: colors.onDark.surface.subtle,
    borderRadius: radius.full,
  },
  dot1: {
    width: 80,
    height: 80,
    top: -20,
    right: -20,
  },
  dot2: {
    width: 40,
    height: 40,
    top: 60,
    right: 40,
  },
  dot3: {
    width: 60,
    height: 60,
    bottom: -10,
    right: 80,
  },
  content: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.bodyMedium,
    color: colors.onDark.text.tertiary,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 34,
    fontWeight: "700" as const,
    lineHeight: 40,
    letterSpacing: -1,
    color: colors.ink.inverse,
    marginBottom: spacing.md,
  },
  seasonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.onDark.surface.light,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  seasonText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.onDark.text.secondary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.onDark.border.subtle,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    ...typography.h1,
    color: colors.ink.inverse,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onDark.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.onDark.surface.light,
  },
});

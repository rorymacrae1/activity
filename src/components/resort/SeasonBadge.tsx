import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { getSeasonalStatus } from "@/services/recommendation";
import type { SeasonalStatus } from "@/services/recommendation";

interface SeasonBadgeProps {
  seasonEnd: string;
}

const BADGE_CONFIG: Record<
  Exclude<SeasonalStatus, "open">,
  { label: string; bg: string; fg: string; icon: string }
> = {
  warning: {
    label: "Closing soon",
    bg: colors.sentiment.errorSubtle,
    fg: colors.sentiment.error,
    icon: "alert-triangle",
  },
  caution: {
    label: "Season ending",
    bg: colors.sentiment.warningSubtle,
    fg: colors.sentiment.warning,
    icon: "calendar",
  },
  closed: {
    label: "Season ended",
    bg: colors.canvas.muted,
    fg: colors.ink.muted,
    icon: "x",
  },
};

/**
 * Compact badge showing seasonal urgency on resort cards.
 * Only renders when season status is not "open".
 */
export function SeasonBadge({ seasonEnd }: SeasonBadgeProps) {
  const { status, daysRemaining } = getSeasonalStatus(seasonEnd);

  if (status === "open") return null;

  const config = BADGE_CONFIG[status];
  const label =
    status === "closed" ? config.label : `${config.label} · ${daysRemaining}d`;

  return (
    <View
      style={[styles.badge, { backgroundColor: config.bg }]}
      accessibilityRole="text"
      accessibilityLabel={`Season ${status}: ${daysRemaining} days remaining`}
    >
      <Icon name={config.icon} size={12} color={config.fg} />
      <Text style={[styles.label, { color: config.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});

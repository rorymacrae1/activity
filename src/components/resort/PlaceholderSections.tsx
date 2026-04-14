/**
 * Resort detail sections: Activities, Accommodation, Transport
 * All three render real data from the Resort type.
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import type { Resort } from "@/types/resort";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  value: string;
  detail?: string;
  iconColor?: string;
}
function InfoRow({
  icon,
  label,
  value,
  detail,
  iconColor = colors.brand.primary,
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: iconColor + "18" }]}>
        <Icon name={icon} size={20} color={iconColor} strokeWidth={1.5} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
        {detail ? <Text style={styles.infoDetail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Activities Section (exported as ReviewsSection to maintain import compat)
// ─────────────────────────────────────────────────────────────────────────────

interface ReviewsSectionProps {
  resort: Resort;
}

/**
 * Shows the resort's real activities, après-ski, and off-slope highlights.
 */
export function ReviewsSection({ resort }: ReviewsSectionProps) {
  const { otherActivities, barCount, nightlifeScore } = resort.attributes;

  const nightlifeLabel =
    nightlifeScore >= 5
      ? "World-class après-ski"
      : nightlifeScore >= 4
        ? "Lively après-ski scene"
        : nightlifeScore >= 3
          ? "Good après-ski options"
          : nightlifeScore >= 2
            ? "Limited après-ski"
            : "Quiet evenings";

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activities & Après-Ski</Text>

      {/* Après-ski summary stats */}
      <View style={styles.apresRow}>
        <View style={styles.apresCard}>
          <Icon
            name="wine"
            size={20}
            color={colors.brand.accent}
            strokeWidth={1.5}
          />
          <Text style={styles.apresValue}>{barCount}</Text>
          <Text style={styles.apresLabel}>Après bars</Text>
        </View>
        <View style={styles.apresCard}>
          <Icon
            name="star"
            size={20}
            color={colors.sentiment.warning}
            strokeWidth={1.5}
          />
          <Text style={styles.apresValue}>{nightlifeScore}/5</Text>
          <Text style={styles.apresLabel}>Nightlife</Text>
        </View>
        <View style={[styles.apresCard, styles.apresCardWide]}>
          <Text style={styles.apresSceneLabel}>{nightlifeLabel}</Text>
        </View>
      </View>

      {/* Activities list */}
      {otherActivities.length > 0 ? (
        <View style={styles.activitiesList}>
          {otherActivities.map((activity, i) => (
            <View key={i} style={styles.activityChip}>
              <Icon
                name="check"
                size={14}
                color={colors.sentiment.success}
                strokeWidth={2.5}
              />
              <Text style={styles.activityText}>{activity}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noActivities}>
          <Text style={styles.noActivitiesText}>
            Skiing is the main focus at this resort.
          </Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accommodation Section
// ─────────────────────────────────────────────────────────────────────────────

interface AccommodationSectionProps {
  resort: Resort;
}

/**
 * Shows real accommodation features surfaced from the accommodation table.
 */
export function AccommodationSection({ resort }: AccommodationSectionProps) {
  const { attributes, name } = resort;
  const { hasSkiInOut, hasCatered, familyScore } = attributes;
  const hasKidsClub = (familyScore ?? 0) >= 4;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Where to Stay</Text>
      <View style={styles.infoStack}>
        <InfoRow
          icon={hasSkiInOut ? "mountain" : "map-pin"}
          label="Ski-in / Ski-out"
          value={hasSkiInOut ? "Available" : "Not available"}
          detail={
            hasSkiInOut
              ? "Slope-side options confirmed"
              : "Short transfer to slopes"
          }
          iconColor={hasSkiInOut ? colors.brand.primary : colors.text.tertiary}
        />
        <InfoRow
          icon="home"
          label={hasCatered ? "Catered chalets" : "Self-catered"}
          value={hasCatered ? "Available" : "Main option"}
          detail={
            hasCatered
              ? "Full-board chalet options"
              : "Apartments & hotels available"
          }
          iconColor={hasCatered ? colors.brand.primary : colors.text.secondary}
        />
        <InfoRow
          icon="users-round"
          label="Kids club"
          value={hasKidsClub ? "Available" : "Check locally"}
          detail={
            hasKidsClub
              ? "Children's facilities on-site"
              : "Standard resort facilities"
          }
          iconColor={
            hasKidsClub ? colors.sentiment.success : colors.text.tertiary
          }
        />
      </View>
      <Text style={styles.footerNote}>
        Search accommodation for {name} on Booking.com, Ski Solutions, or
        Inghams.
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Transport Section
// ─────────────────────────────────────────────────────────────────────────────

interface TransportSectionProps {
  resort: Resort;
}

/**
 * Shows real transport options using airport, train, and drive data.
 */
export function TransportSection({ resort }: TransportSectionProps) {
  const {
    nearestAirport,
    transferTimeMinutes,
    trainAccessible,
    eurostarDirect,
    trainJourneyHours,
    driveHoursFromLondon,
  } = resort.attributes;

  const transferHours = Math.floor(transferTimeMinutes / 60);
  const transferMins = transferTimeMinutes % 60;
  const transferDisplay =
    transferHours > 0
      ? transferMins > 0
        ? `${transferHours}h ${transferMins}m transfer`
        : `${transferHours}h transfer`
      : `${transferMins}m transfer`;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Getting There</Text>
      <View style={styles.infoStack}>
        <InfoRow
          icon="plane"
          label="Fly"
          value={nearestAirport}
          detail={transferDisplay}
          iconColor={colors.brand.primary}
        />
        {trainAccessible && (
          <InfoRow
            icon="train"
            label="Train"
            value={
              eurostarDirect
                ? "Eurostar direct"
                : trainJourneyHours != null
                  ? `~${trainJourneyHours}h from London`
                  : "Rail connection available"
            }
            detail={
              eurostarDirect
                ? "Direct from London St Pancras"
                : "Change required — check Trainline"
            }
            iconColor={colors.sentiment.success}
          />
        )}
        <InfoRow
          icon="car"
          label="Drive"
          value={
            driveHoursFromLondon != null
              ? `~${driveHoursFromLondon}h from London`
              : `${resort.region}, ${resort.country}`
          }
          detail={
            driveHoursFromLondon != null
              ? "Via Channel Tunnel or ferry"
              : "Check Google Maps for directions"
          }
          iconColor={colors.text.secondary}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  // ── Shared info rows ──
  infoStack: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.labelSmall,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: "600",
  },
  infoDetail: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  // ── Activities ──
  apresRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  apresCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border.subtle,
    minWidth: 76,
    gap: 2,
  },
  apresCardWide: {
    flex: 1,
    alignItems: "flex-start",
    paddingHorizontal: spacing.md,
  },
  apresValue: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: "700",
  },
  apresLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  apresSceneLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: "500",
  },
  activitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  activityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.xs,
  },
  activityText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  noActivities: {
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noActivitiesText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  // ── Accommodation ──
  footerNote: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    fontStyle: "italic",
  },
});

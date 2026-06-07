/**
 * Resort detail sections: Activities, Accommodation, Transport
 * All three render real data from the Resort type.
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Linking, Pressable } from "react-native";
import { Text } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import { useAuthStore } from "@/stores/auth";
import { isUKIrelandAirport, getAirportCountry } from "@/lib/airportCountry";
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
 * Shows the resort's real activities, après-ski, facility details, and off-slope highlights.
 */
export function ReviewsSection({ resort }: ReviewsSectionProps) {
  const { otherActivities, barCount, nightlifeScore } = resort.attributes;
  const { facilityOptions } = resort;

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

  // Group facilities by type for display
  const hasFacilities = facilityOptions && facilityOptions.length > 0;
  const facilityGroups = hasFacilities
    ? facilityOptions.reduce<Record<string, typeof facilityOptions>>((acc, f) => {
        const key = f.type ?? "other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(f);
        return acc;
      }, {})
    : null;

  const facilityTypeLabels: Record<string, string> = {
    restaurant: "Restaurants",
    bar: "Bars & Nightlife",
    ski_school: "Ski Schools",
    ski_rental: "Ski Rental",
    spa: "Spa & Wellness",
    pool: "Swimming Pools",
    supermarket: "Supermarkets",
  };

  const facilityTypeIcons: Record<string, React.ComponentProps<typeof Icon>["name"]> = {
    restaurant: "utensils",
    bar: "wine",
    ski_school: "graduation-cap",
    ski_rental: "package",
    spa: "sparkles",
    pool: "waves",
    supermarket: "shopping-cart",
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activities & Après-Ski</Text>

      {/* AI-generated après-ski narrative */}
      {resort.content.apresSummary ? (
        <Text style={styles.narrativeSummary}>{resort.content.apresSummary}</Text>
      ) : null}

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

      {/* Facility details — only if data is available */}
      {hasFacilities && facilityGroups ? (
        <View style={styles.facilitySection}>
          <Text style={styles.facilitySectionTitle}>Facilities</Text>
          {Object.entries(facilityGroups).map(([type, items]) => (
            <View key={type} style={styles.facilityGroup}>
              <View style={styles.facilityGroupHeader}>
                <Icon
                  name={facilityTypeIcons[type] ?? "circle"}
                  size={16}
                  color={colors.brand.primary}
                  strokeWidth={1.5}
                />
                <Text style={styles.facilityGroupTitle}>
                  {facilityTypeLabels[type] ?? type} ({items.length})
                </Text>
              </View>
              {items.slice(0, 4).map((item, idx) => (
                <View key={idx} style={styles.facilityItem}>
                  <Text style={styles.facilityItemName}>{item.name}</Text>
                  <View style={styles.facilityItemMeta}>
                    {item.rating != null ? (
                      <View style={styles.accomChip}>
                        <Icon name="star" size={11} color={colors.sentiment.warning} strokeWidth={2} />
                        <Text style={styles.accomChipText}>{item.rating.toFixed(1)}</Text>
                      </View>
                    ) : null}
                    {item.avgPriceGbp != null ? (
                      <Text style={styles.facilityPrice}>~£{item.avgPriceGbp}</Text>
                    ) : null}
                    {item.apresSki ? (
                      <View style={styles.accomChip}>
                        <Text style={styles.accomChipText}>Après-ski</Text>
                      </View>
                    ) : null}
                    {item.whiteoutActivity ? (
                      <View style={styles.accomChip}>
                        <Text style={styles.accomChipText}>Bad weather option</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
              {items.length > 4 ? (
                <Text style={styles.accomMore}>
                  +{items.length - 4} more
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
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
 * When detailed accommodation data is available, renders individual listings.
 */
export function AccommodationSection({ resort }: AccommodationSectionProps) {
  const { attributes, name, accommodationOptions } = resort;
  const { hasSkiInOut, hasCatered, hasKidsClub } = attributes;

  const hasDetailedData = accommodationOptions && accommodationOptions.length > 0;

  // Group accommodation by type for display
  const grouped = hasDetailedData
    ? accommodationOptions.reduce<Record<string, typeof accommodationOptions>>((acc, item) => {
        const key = item.type ?? "other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {})
    : null;

  const typeIcons: Record<string, React.ComponentProps<typeof Icon>["name"]> = {
    hotel: "building",
    chalet: "home",
    apartment: "layout-grid",
    hostel: "bed",
  };

  const typeLabels: Record<string, string> = {
    hotel: "Hotels",
    chalet: "Chalets",
    apartment: "Apartments",
    hostel: "Hostels",
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Where to Stay</Text>

      {hasDetailedData && grouped ? (
        <View style={styles.infoStack}>
          {Object.entries(grouped).map(([type, items]) => (
            <View key={type} style={styles.accomGroup}>
              <View style={styles.accomGroupHeader}>
                <Icon
                  name={typeIcons[type] ?? "home"}
                  size={18}
                  color={colors.brand.primary}
                  strokeWidth={1.5}
                />
                <Text style={styles.accomGroupTitle}>
                  {typeLabels[type] ?? type} ({items.length})
                </Text>
              </View>
              {items.slice(0, 5).map((item, idx) => (
                <View key={idx} style={styles.accomItem}>
                  <Text style={styles.accomItemName}>{item.name}</Text>
                  <View style={styles.accomItemMeta}>
                    {item.stars != null && item.stars > 0 ? (
                      <View style={styles.accomChip}>
                        <Icon name="star" size={12} color={colors.sentiment.warning} strokeWidth={2} />
                        <Text style={styles.accomChipText}>{item.stars}★</Text>
                      </View>
                    ) : null}
                    {item.skiInOut ? (
                      <View style={styles.accomChip}>
                        <Text style={styles.accomChipText}>Ski-in/out</Text>
                      </View>
                    ) : null}
                    {item.catered ? (
                      <View style={styles.accomChip}>
                        <Text style={styles.accomChipText}>Catered</Text>
                      </View>
                    ) : null}
                    {item.kidsClub ? (
                      <View style={styles.accomChip}>
                        <Text style={styles.accomChipText}>Kids club</Text>
                      </View>
                    ) : null}
                    {item.pricePerNightGbp != null ? (
                      <Text style={styles.accomPrice}>
                        from £{item.pricePerNightGbp}/night
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
              {items.length > 5 ? (
                <Text style={styles.accomMore}>
                  +{items.length - 5} more {typeLabels[type]?.toLowerCase() ?? "options"}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
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
            iconColor={hasSkiInOut ? colors.brand.primary : colors.ink.muted}
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
            iconColor={hasCatered ? colors.brand.primary : colors.ink.normal}
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
              hasKidsClub ? colors.sentiment.success : colors.ink.muted
            }
          />
        </View>
      )}
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
 * Train and drive rows adapt based on the user's home airport country.
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

  const homeAirport = useAuthStore((s) => s.profile?.home_airport ?? null);
  const [originCountry, setOriginCountry] = useState<string | null>(null);

  useEffect(() => {
    if (!homeAirport) {
      setOriginCountry(null);
      return;
    }
    // Fast synchronous check for UK/Ireland — no bundle load needed
    if (isUKIrelandAirport(homeAirport)) {
      setOriginCountry("United Kingdom");
      return;
    }
    getAirportCountry(homeAirport).then(setOriginCountry);
  }, [homeAirport]);

  // When home airport is unknown or outside UK/Ireland, hide London-centric rows
  const isUKUser =
    originCountry === null || // default for logged-out / no preference set
    originCountry === "United Kingdom" ||
    originCountry === "Ireland";

  const transferHours = Math.floor(transferTimeMinutes / 60);
  const transferMins = transferTimeMinutes % 60;
  const transferDisplay =
    transferHours > 0
      ? transferMins > 0
        ? `${transferHours}h ${transferMins}m transfer`
        : `${transferHours}h transfer`
      : transferMins > 0
        ? `${transferMins}m transfer`
        : "Transfer time unknown";

  // Format decimal hours as e.g. "8h 30m" or "11h"
  function formatHours(h: number): string {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    return mins > 0 ? `${whole}h ${mins}m` : `${whole}h`;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Getting There</Text>
      <View style={styles.infoStack}>
        {/* Fly — always shown, nearest airport is origin-agnostic */}
        {nearestAirport ? (
          <InfoRow
            icon="plane"
            label="Fly"
            value={nearestAirport}
            detail={transferDisplay}
            iconColor={colors.brand.primary}
          />
        ) : null}

        {/* Train — only meaningful for UK/Ireland users */}
        {trainAccessible && isUKUser && (
          <InfoRow
            icon="train"
            label="Train"
            value={
              eurostarDirect
                ? "Eurostar direct"
                : trainJourneyHours != null
                  ? `~${formatHours(trainJourneyHours)} from London`
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
        {trainAccessible && !isUKUser && (
          <InfoRow
            icon="train"
            label="Train"
            value="Rail accessible"
            detail="Check local rail routes"
            iconColor={colors.sentiment.success}
          />
        )}

        {/* Drive — UK users get London-origin time; others get a generic prompt */}
        {isUKUser && driveHoursFromLondon != null ? (
          <InfoRow
            icon="car"
            label="Drive"
            value={`~${formatHours(driveHoursFromLondon)} from London`}
            detail="Via Channel Tunnel or ferry"
            iconColor={colors.ink.muted}
          />
        ) : (
          <InfoRow
            icon="car"
            label="Drive"
            value={resort.region !== resort.country ? `${resort.region}, ${resort.country}` : resort.country}
            detail="Check Google Maps for directions"
            iconColor={colors.ink.muted}
          />
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Live Conditions Section — webcam + snow report links
// ─────────────────────────────────────────────────────────────────────────────

interface LiveConditionsSectionProps {
  resort: Resort;
}

/**
 * Shows live webcam and snow report links when available in resort content.
 * Only renders if at least one link is present.
 */
export function LiveConditionsSection({ resort }: LiveConditionsSectionProps) {
  const { webcamUrl, snowReportUrl } = resort.content;
  if (!webcamUrl && !snowReportUrl) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Live Conditions</Text>
      <View style={styles.infoStack}>
        {webcamUrl ? (
          <Pressable
            style={styles.linkRow}
            onPress={() => Linking.openURL(webcamUrl)}
            accessibilityRole="link"
            accessibilityLabel={`View live webcam for ${resort.name}`}
          >
            <View style={[styles.infoIcon, { backgroundColor: colors.brand.primary + "18" }]}>
              <Icon name="video" size={20} color={colors.brand.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Webcam</Text>
              <Text style={styles.infoValue}>Live camera view</Text>
              <Text style={styles.linkHint}>Tap to open ↗</Text>
            </View>
          </Pressable>
        ) : null}
        {snowReportUrl ? (
          <Pressable
            style={styles.linkRow}
            onPress={() => Linking.openURL(snowReportUrl)}
            accessibilityRole="link"
            accessibilityLabel={`View snow report for ${resort.name}`}
          >
            <View style={[styles.infoIcon, { backgroundColor: colors.brand.accent + "18" }]}>
              <Icon name="snowflake" size={20} color={colors.brand.accent} strokeWidth={1.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Snow Report</Text>
              <Text style={styles.infoValue}>Latest conditions</Text>
              <Text style={styles.linkHint}>Tap to open ↗</Text>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Resort Guides Section — whiteout, no-fly, snowmaking, off-piste narratives
// ─────────────────────────────────────────────────────────────────────────────

interface GuideItemProps {
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  body: string;
  iconColor?: string;
}

function GuideItem({ icon, title, body, iconColor = colors.brand.primary }: GuideItemProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Pressable
      style={styles.guideItem}
      onPress={() => setExpanded((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={`${title} — ${expanded ? "collapse" : "expand"}`}
    >
      <View style={styles.guideHeader}>
        <View style={[styles.infoIcon, { backgroundColor: iconColor + "18" }]}>
          <Icon name={icon} size={20} color={iconColor} strokeWidth={1.5} />
        </View>
        <Text style={styles.guideTitle}>{title}</Text>
        <Icon
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.ink.muted}
          strokeWidth={2}
        />
      </View>
      {expanded ? (
        <Text style={styles.guideBody}>{body}</Text>
      ) : null}
    </Pressable>
  );
}

interface ResortGuidesSectionProps {
  resort: Resort;
}

/**
 * Collapsible guide sections using the AI-generated content narratives.
 * Only shows sections where content exists.
 */
export function ResortGuidesSection({ resort }: ResortGuidesSectionProps) {
  const { whiteoutSummary, noFlySummary, snowmakingSummary, offPisteSummary } = resort.content;
  const guides = [
    whiteoutSummary && {
      icon: "cloud" as const,
      title: "Bad Weather Days",
      body: whiteoutSummary,
      iconColor: colors.ink.muted,
    },
    noFlySummary && {
      icon: "train" as const,
      title: "Get There Without Flying",
      body: noFlySummary,
      iconColor: colors.sentiment.success,
    },
    snowmakingSummary && {
      icon: "snowflake" as const,
      title: "Snow Reliability",
      body: snowmakingSummary,
      iconColor: colors.brand.primary,
    },
    offPisteSummary && {
      icon: "mountain" as const,
      title: "Off-Piste & Backcountry",
      body: offPisteSummary,
      iconColor: colors.brand.accent,
    },
  ].filter(Boolean) as GuideItemProps[];

  if (guides.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Resort Guides</Text>
      <View style={styles.guideStack}>
        {guides.map((guide) => (
          <GuideItem key={guide.title} {...guide} />
        ))}
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
    color: colors.ink.rich,
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
    color: colors.ink.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.ink.rich,
    fontWeight: "600",
  },
  infoDetail: {
    ...typography.bodySmall,
    color: colors.ink.normal,
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
    color: colors.ink.rich,
    fontWeight: "700",
  },
  apresLabel: {
    ...typography.caption,
    color: colors.ink.muted,
  },
  apresSceneLabel: {
    ...typography.bodyMedium,
    color: colors.ink.rich,
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
    color: colors.ink.rich,
  },
  noActivities: {
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noActivitiesText: {
    ...typography.bodySmall,
    color: colors.ink.normal,
  },
  // ── Accommodation ──
  footerNote: {
    ...typography.caption,
    color: colors.ink.muted,
    marginTop: spacing.md,
    fontStyle: "italic",
  },
  accomGroup: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.sm,
  },
  accomGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  accomGroupTitle: {
    ...typography.bodyMedium,
    color: colors.ink.rich,
    fontWeight: "600",
  },
  accomItem: {
    paddingLeft: spacing.lg,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  accomItemName: {
    ...typography.bodySmall,
    color: colors.ink.rich,
    fontWeight: "500",
  },
  accomItemMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 2,
  },
  accomChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    gap: 2,
  },
  accomChipText: {
    ...typography.caption,
    color: colors.ink.normal,
  },
  accomPrice: {
    ...typography.caption,
    color: colors.brand.primary,
    fontWeight: "500",
  },
  accomMore: {
    ...typography.caption,
    color: colors.ink.muted,
    paddingLeft: spacing.lg,
    fontStyle: "italic",
  },
  // ── Facilities ──
  facilitySection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  facilitySectionTitle: {
    ...typography.bodyLarge,
    color: colors.ink.rich,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  facilityGroup: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.xs,
  },
  facilityGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  facilityGroupTitle: {
    ...typography.bodySmall,
    color: colors.ink.rich,
    fontWeight: "600",
  },
  facilityItem: {
    paddingLeft: spacing.lg,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  facilityItemName: {
    ...typography.bodySmall,
    color: colors.ink.rich,
    fontWeight: "500",
  },
  facilityItemMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 2,
  },
  facilityPrice: {
    ...typography.caption,
    color: colors.ink.muted,
  },
  // ── Narrative summary ──
  narrativeSummary: {
    ...typography.body,
    color: colors.ink.normal,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  // ── Live conditions links ──
  linkRow: {
    flexDirection: "row",
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: "flex-start",
  },
  linkHint: {
    ...typography.bodySmall,
    color: colors.brand.primary,
    marginTop: 2,
  },
  // ── Guide items ──
  guideStack: {
    gap: spacing.sm,
  },
  guideItem: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  guideTitle: {
    ...typography.bodyMedium,
    color: colors.ink.rich,
    fontWeight: "600",
    flex: 1,
  },
  guideBody: {
    ...typography.body,
    color: colors.ink.normal,
    lineHeight: 22,
    marginTop: spacing.md,
    paddingLeft: 48, // align under title (icon 40 + gap 8)
  },
});

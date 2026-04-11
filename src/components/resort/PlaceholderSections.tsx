/**
 * PlaceholderSections - Future integration placeholders
 * Reviews, Accommodation, and Transport sections with coming soon UI
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import type { Resort } from "@/types/resort";

// ─────────────────────────────────────────────────────────────────────────────
// Reviews Section
// ─────────────────────────────────────────────────────────────────────────────

interface ReviewsSectionProps {
  resort: Resort;
}

/**
 * Placeholder for reviews integration (TripAdvisor, Google, etc.)
 */
export function ReviewsSection({ resort }: ReviewsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Reviews</Text>
      <View style={styles.placeholderCard}>
        <View style={styles.placeholderIcon}>
          <Icon
            name="star"
            size={24}
            color={colors.sentiment.warning}
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderTitle}>Reviews coming soon</Text>
          <Text style={styles.placeholderText}>
            We're working on integrating reviews from trusted sources to help
            you make the best choice.
          </Text>
        </View>
      </View>
      {/* Mock review preview */}
      <View style={styles.mockReviews}>
        <View style={styles.mockReview}>
          <View style={styles.mockAvatar}>
            <Text style={styles.mockAvatarText}>SK</Text>
          </View>
          <View style={styles.mockReviewContent}>
            <View style={styles.mockStars}>
              <Text style={styles.starText}>★★★★★</Text>
            </View>
            <Text style={styles.mockReviewText} numberOfLines={2}>
              "Amazing resort with incredible views and great snow
              conditions..."
            </Text>
          </View>
        </View>
        <View style={[styles.mockReview, styles.mockReviewFaded]}>
          <View style={styles.mockAvatar}>
            <Text style={styles.mockAvatarText}>JD</Text>
          </View>
          <View style={styles.mockReviewContent}>
            <View style={styles.mockStars}>
              <Text style={styles.starText}>★★★★☆</Text>
            </View>
            <Text style={styles.mockReviewText} numberOfLines={2}>
              "Perfect for families, easy access from the airport..."
            </Text>
          </View>
        </View>
      </View>
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
 * Placeholder for accommodation integration (Booking.com, etc.)
 */
export function AccommodationSection({ resort }: AccommodationSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Where Can I Stay?</Text>
      <View style={styles.placeholderCard}>
        <View style={styles.placeholderIcon}>
          <Icon
            name="hotel"
            size={24}
            color={colors.brand.primary}
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderTitle}>
            Accommodation search coming soon
          </Text>
          <Text style={styles.placeholderText}>
            Find hotels, chalets, and apartments near {resort.name}.
          </Text>
        </View>
      </View>
      {/* Quick links */}
      <View style={styles.quickLinks}>
        <Pressable
          style={styles.quickLink}
          accessibilityRole="button"
          accessibilityLabel="Search hotels"
        >
          <Icon
            name="hotel"
            size={20}
            color={colors.text.secondary}
            strokeWidth={1.5}
          />
          <Text style={styles.quickLinkText}>Hotels</Text>
        </Pressable>
        <Pressable
          style={styles.quickLink}
          accessibilityRole="button"
          accessibilityLabel="Search chalets"
        >
          <Icon
            name="mountain"
            size={20}
            color={colors.text.secondary}
            strokeWidth={1.5}
          />
          <Text style={styles.quickLinkText}>Chalets</Text>
        </Pressable>
        <Pressable
          style={styles.quickLink}
          accessibilityRole="button"
          accessibilityLabel="Search apartments"
        >
          <Icon
            name="home"
            size={20}
            color={colors.text.secondary}
            strokeWidth={1.5}
          />
          <Text style={styles.quickLinkText}>Apartments</Text>
        </Pressable>
      </View>
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
 * Transport information section showing how to get to the resort
 */
export function TransportSection({ resort }: TransportSectionProps) {
  const { nearestAirport, transferTimeMinutes } = resort.attributes;
  const transferHours = Math.floor(transferTimeMinutes / 60);
  const transferMins = transferTimeMinutes % 60;
  const transferDisplay =
    transferHours > 0
      ? `${transferHours}h ${transferMins}m`
      : `${transferMins}m`;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>How Do I Get There?</Text>

      {/* Transport options */}
      <View style={styles.transportOptions}>
        {/* Nearest Airport */}
        <View style={styles.transportOption}>
          <View style={styles.transportIcon}>
            <Icon
              name="plane"
              size={20}
              color={colors.brand.primary}
              strokeWidth={1.5}
            />
          </View>
          <View style={styles.transportContent}>
            <Text style={styles.transportLabel}>Nearest Airport</Text>
            <Text style={styles.transportValue}>{nearestAirport}</Text>
            <Text style={styles.transportDetail}>
              Transfer: ~{transferDisplay}
            </Text>
          </View>
        </View>

        {/* Drive time placeholder */}
        <View style={styles.transportOption}>
          <View style={styles.transportIcon}>
            <Icon
              name="car"
              size={20}
              color={colors.brand.primary}
              strokeWidth={1.5}
            />
          </View>
          <View style={styles.transportContent}>
            <Text style={styles.transportLabel}>By Car</Text>
            <Text style={styles.transportValue}>
              {resort.region}, {resort.country}
            </Text>
            <Text style={styles.transportDetail}>
              Scenic mountain route available
            </Text>
          </View>
        </View>

        {/* Train placeholder */}
        <View style={styles.transportOption}>
          <View style={styles.transportIcon}>
            <Icon
              name="train"
              size={20}
              color={colors.brand.primary}
              strokeWidth={1.5}
            />
          </View>
          <View style={styles.transportContent}>
            <Text style={styles.transportLabel}>By Train</Text>
            <Text style={styles.transportValue}>
              Rail connections available
            </Text>
            <Text style={styles.transportDetail}>
              Check local rail services
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  placeholderCard: {
    flexDirection: "row",
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderStyle: "dashed",
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  placeholderContent: {
    flex: 1,
  },
  placeholderTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  placeholderText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  // Mock reviews
  mockReviews: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  mockReview: {
    flexDirection: "row",
    backgroundColor: colors.surface.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  mockReviewFaded: {
    opacity: 0.5,
  },
  mockAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  mockAvatarText: {
    ...typography.labelSmall,
    color: colors.brand.primary,
    fontWeight: "600",
  },
  mockReviewContent: {
    flex: 1,
  },
  mockStars: {
    marginBottom: spacing.xxs,
  },
  starText: {
    color: colors.match.fair,
    fontSize: 12,
  },
  mockReviewText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  // Quick links
  quickLinks: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  quickLink: {
    flex: 1,
    backgroundColor: colors.surface.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.xs,
  },
  quickLinkText: {
    ...typography.labelSmall,
    color: colors.text.primary,
  },
  // Transport options
  transportOptions: {
    gap: spacing.sm,
  },
  transportOption: {
    flexDirection: "row",
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  transportIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface.tertiary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  transportContent: {
    flex: 1,
  },
  transportLabel: {
    ...typography.labelSmall,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transportValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: "500",
  },
  transportDetail: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
});

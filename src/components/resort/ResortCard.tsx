import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@components/ui/Card";
import { Text } from "@components/ui/Text";
import { ResortImage } from "@components/ui/ResortImage";
import { useLayout } from "@hooks/useLayout";
import { useProfile } from "@stores/auth";
import { colors, spacing, radius } from "@theme";
import type { RecommendationResult } from "@/types/recommendation";

interface ResortCardProps {
  result: RecommendationResult;
  rank?: number;
  onPress: () => void;
  showMatchScore?: boolean;
}

/**
 * Luxury resort card for recommendations list.
 * Features gradient overlays, refined typography, and premium visual treatment.
 */
export function ResortCard({
  result,
  rank,
  onPress,
  showMatchScore = true,
}: ResortCardProps) {
  const { resort, matchScore, matchReasons } = result;
  const { cardImageHeight } = useLayout();
  const profile = useProfile();
  const homeAirport = profile?.home_airport ?? null;
  const nearestAirport = resort.attributes.nearestAirport;
  const transferMins = resort.attributes.transferTimeMinutes;
  const isOwnAirport = homeAirport === nearestAirport;

  const isTopPick = rank === 1;

  return (
    <Card
      elevation={isTopPick ? "elevated" : "standard"}
      onPress={onPress}
      noPadding
      style={isTopPick ? styles.topPick : undefined}
      accessibilityLabel={`${resort.name}, ${matchScore}% match`}
    >
      {/* Hero image with gradient overlay */}
      <View style={[styles.imageContainer, { height: cardImageHeight }]}>
        <ResortImage uri={resort.assets.heroImage} style={styles.image} />
        {/* Bottom gradient for depth */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)"]}
          style={styles.imageGradient}
        />
        {/* Rank badge - Alpine Blue for #1, refined dark for others */}
        {rank ? (
          <View style={[styles.rankBadge, isTopPick && styles.rankBadgeTop]}>
            <Text style={[styles.rankText, isTopPick && styles.rankTextTop]}>
              #{rank}
            </Text>
          </View>
        ) : null}
        {/* Match score - elegant circular indicator */}
        {showMatchScore && matchScore > 0 ? (
          <View style={styles.matchBadge}>
            <Text style={styles.matchScore}>{matchScore}</Text>
            <Text style={styles.matchPercent}>%</Text>
          </View>
        ) : null}
      </View>

      {/* Content area */}
      <View style={styles.content}>
        {/* Resort name - prominent */}
        <Text variant="h3" numberOfLines={1}>
          {resort.name}
        </Text>

        {/* Location with refined separator */}
        <Text variant="caption" color={colors.ink.muted}>
          {resort.country} · {resort.region}
        </Text>

        {/* Stats row - refined presentation */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{resort.stats.totalKm}</Text>
            <Text style={styles.statLabel}>km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {resort.attributes.snowReliability}/5
            </Text>
            <Text style={styles.statLabel}>snow</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              €{resort.attributes.averageDailyCost}
            </Text>
            <Text style={styles.statLabel}>/day</Text>
          </View>
        </View>

        {/* Airport row — shows nearest ski airport and transfer time */}
        {nearestAirport ? (
          <View style={styles.airportRow}>
            <Text style={styles.airportText}>
              {homeAirport
                ? `✈ ${homeAirport} → ${nearestAirport}`
                : `✈ ${nearestAirport}`}
            </Text>
            <Text style={styles.airportSub}>
              {isOwnAirport ? "your airport · " : ""}
              {transferMins}min transfer
            </Text>
          </View>
        ) : null}

        {/* Match reasons - elegant checkmarks */}
        {showMatchScore && matchReasons.length > 0 ? (
          <View style={styles.reasons}>
            {matchReasons.slice(0, 2).map((reason, i) => (
              <View key={i} style={styles.reasonRow}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text
                  variant="caption"
                  color={colors.ink.normal}
                  numberOfLines={1}
                  style={styles.reasonText}
                >
                  {reason}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topPick: {
    borderWidth: 2,
    borderColor: colors.brand.primary,
    // Subtle Alpine Blue glow
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.canvas.subtle,
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  rankBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.surface.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    minWidth: 32,
    alignItems: "center",
  },
  rankBadgeTop: {
    backgroundColor: colors.brand.primary,
  },
  rankText: {
    color: colors.ink.inverse,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  rankTextTop: {
    color: colors.ink.onBrand,
  },
  matchBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "baseline",
    // Subtle shadow
    shadowColor: colors.ink.rich,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand.primary,
    letterSpacing: -0.5,
  },
  matchPercent: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.brand.primary,
    marginLeft: 1,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  stat: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink.rich,
  },
  statLabel: {
    fontSize: 12,
    color: colors.ink.muted,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.sm,
  },
  airportRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  airportText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink.normal,
  },
  airportSub: {
    fontSize: 11,
    color: colors.ink.muted,
  },
  reasons: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  reasonText: {
    flex: 1,
  },
});

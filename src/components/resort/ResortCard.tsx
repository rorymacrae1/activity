import { View, StyleSheet, Image } from "react-native";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { useLayout } from "@/hooks/useLayout";
import { colors, spacing, typography } from "@/theme";
import type { RecommendationResult } from "@/types/recommendation";

interface ResortCardProps {
  result: RecommendationResult;
  rank?: number;
  onPress: () => void;
  showMatchScore?: boolean;
}

const getMatchVariant = (score: number): "success" | "primary" | "warning" | "error" => {
  if (score >= 80) return "success";
  if (score >= 60) return "primary";
  if (score >= 40) return "warning";
  return "error";
};

/**
 * Card component displaying a resort in the recommendations list.
 * Adapts hero image height based on screen size.
 */
export function ResortCard({
  result,
  rank,
  onPress,
  showMatchScore = true,
}: ResortCardProps) {
  const { resort, matchScore, matchReasons } = result;
  const { cardImageHeight } = useLayout();

  return (
    <Card
      elevation="md"
      onPress={onPress}
      noPadding
      accessibilityLabel={`${resort.name}, ${matchScore}% match`}
    >
      {/* Hero image — height adapts to screen size */}
      <View style={[styles.imageContainer, { height: cardImageHeight }]}>
        <Image
          source={{ uri: resort.assets.heroImage }}
          style={styles.image}
          resizeMode="cover"
        />
        {rank ? (
          <View style={styles.rankBadge}>
            <Text style={[typography.captionMedium, { color: colors.text.inverse }]}>
              #{rank}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text variant="h3" numberOfLines={1}>{resort.name}</Text>
            <Text variant="caption" color={colors.text.tertiary} style={styles.location}>
              {resort.country} • {resort.region}
            </Text>
          </View>
          {showMatchScore && matchScore > 0 ? (
            <Badge label={`${matchScore}%`} variant={getMatchVariant(matchScore)} />
          ) : null}
        </View>

        {/* Stats row */}
        <View style={styles.stats}>
          <StatPill icon="⛷️" label={`${resort.stats.totalKm}km`} />
          <StatPill icon="❄️" label={`${resort.attributes.snowReliability}/5 snow`} />
          <StatPill icon="💰" label={`€${resort.attributes.averageDailyCost}/day`} />
        </View>

        {/* Match reasons */}
        {showMatchScore && matchReasons.length > 0 ? (
          <View style={styles.reasons}>
            {matchReasons.slice(0, 2).map((reason, i) => (
              <Text key={i} variant="caption" color={colors.success} numberOfLines={1}>
                ✓ {reason}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

function StatPill({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text variant="caption" color={colors.text.secondary}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background.secondary,
  },
  rankBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.background.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 6,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
  location: {
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  statIcon: {
    fontSize: 12,
  },
  reasons: {
    gap: spacing.xxs,
  },
});

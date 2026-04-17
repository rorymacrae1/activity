import { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { Text } from "@components/ui/Text";
import { Icon } from "@components/ui/Icon";
import { ResortImage } from "@components/ui/ResortImage";
import { colors, spacing, radius, typography } from "@theme";
import type { RecommendationResult } from "@/types/recommendation";

const { width: _SCREEN_WIDTH } = Dimensions.get("window");

interface TopPickHeroProps {
  result: RecommendationResult;
  /** Optional press handler - makes the hero tappable */
  onPress?: () => void;
}

/**
 * Large hero display for the top recommended resort.
 * Features prominent match score, resort details, and premium visual treatment.
 * Tappable if onPress is provided.
 */
export function TopPickHero({ result, onPress }: TopPickHeroProps) {
  const { resort, matchScore } = result;

  // Count-up animation: 0 → matchScore over ~900ms with ease-out
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (matchScore <= 0) return;
    const steps = Math.min(matchScore, 45);
    const interval = 900 / steps;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      const eased = 1 - Math.pow(1 - count / steps, 2);
      setDisplayScore(Math.min(Math.round(eased * matchScore), matchScore));
      if (count >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [matchScore]);

  // Entrance animation: fade + rise from below
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  useEffect(() => {
    opacity.value = withDelay(120, withSpring(1, { damping: 20, stiffness: 200 }));
    translateY.value = withDelay(120, withSpring(0, { damping: 18, stiffness: 220 }));
  }, [opacity, translateY]);
  const heroStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const content = (
    <Animated.View style={[styles.container, heroStyle]}>
      {/* Hero image with gradient overlays */}
      <View style={styles.imageContainer}>
        <ResortImage
          uri={resort.assets.heroImage}
          style={styles.image}
          accessibilityLabel={`${resort.name} ski resort`}
        />
        {/* Top gradient for text legibility */}
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent"]}
          style={styles.topGradient}
          pointerEvents="none"
        />
        {/* Bottom gradient for depth */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* Top Pick badge */}
        <View style={styles.topBadge} pointerEvents="none">
          <Icon
            name="star"
            size={14}
            color={colors.rank.gold}
            strokeWidth={2}
          />
          <Text style={styles.topBadgeText}>Your Perfect Match</Text>
        </View>

        {/* Match score - prominent circular indicator */}
        <View style={styles.matchScoreContainer} pointerEvents="none">
          <View style={styles.matchScoreRing}>
            <Text style={styles.matchScoreValue}>{displayScore}</Text>
            <Text style={styles.matchScorePercent}>%</Text>
          </View>
          <Text style={styles.matchScoreLabel}>Match</Text>
        </View>

        {/* Resort info overlay */}
        <View style={styles.infoOverlay} pointerEvents="none">
          <Text style={styles.resortName}>{resort.name}</Text>
          <Text style={styles.location}>
            {resort.region}, {resort.country}
          </Text>

          {/* Quick stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{resort.stats.totalKm}km</Text>
              <Text style={styles.statLabel}>pistes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {resort.location.peakAltitude}m
              </Text>
              <Text style={styles.statLabel}>peak</Text>
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
        </View>
      </View>
    </Animated.View>
  );

  // Wrap in Pressable if onPress is provided
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View ${resort.name} details`}
        accessibilityHint="Opens the resort detail page"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  imageContainer: {
    height: 320,
    borderRadius: radius.xl,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.canvas.subtle,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  topBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.onDark.surface.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  topBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink.rich,
  },
  matchScoreContainer: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    alignItems: "center",
  },
  matchScoreRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  matchScoreValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.ink.inverse,
  },
  matchScorePercent: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onDark.text.tertiary,
    marginTop: 2,
  },
  matchScoreLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.onDark.text.secondary,
    marginTop: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  resortName: {
    ...typography.h1,
    color: colors.ink.inverse,
    marginBottom: spacing.xs,
  },
  location: {
    fontSize: 15,
    color: colors.onDark.text.secondary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink.inverse,
  },
  statLabel: {
    fontSize: 11,
    color: colors.onDark.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.onDark.surface.medium,
    marginHorizontal: spacing.md,
  },
});

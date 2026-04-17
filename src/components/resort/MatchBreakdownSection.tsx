/**
 * MatchBreakdownSection
 *
 * Explains why a resort was recommended using:
 *  - A radar chart of the 5 scoring dimensions
 *  - Plain-English reason bullets from the explainer
 *  - A brief plain-language note on what the scoring does
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg";
import { Text } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { typography } from "@/theme/typography";
import { generateExplanations } from "@/services/recommendation/explainer";
import { calculateScores } from "@/services/recommendation/scorer";
import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";
import type { AttributeScores } from "@/types/recommendation";

// ─────────────────────────────────────────────────────────────────────────────
// Radar chart
// ─────────────────────────────────────────────────────────────────────────────

const CHART_SIZE = 220;
const CENTER = CHART_SIZE / 2;
const MAX_RADIUS = 80;
const RINGS = 4; // concentric rings at 25 / 50 / 75 / 100

const DIMENSIONS: {
  key: keyof AttributeScores;
  label: string;
  icon: string;
}[] = [
  { key: "skill", label: "Skill", icon: "⛷" },
  { key: "snow", label: "Snow", icon: "❄️" },
  { key: "budget", label: "Budget", icon: "💷" },
  { key: "activity", label: "Activity", icon: "🎿" },
  { key: "vibe", label: "Vibe", icon: "✨" },
];

/** Convert polar (angle, radius) to SVG cartesian coords. Angle 0 = top. */
function polar(angle: number, r: number): { x: number; y: number } {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function scoreToRadius(score: number): number {
  return (score / 100) * MAX_RADIUS;
}

interface RadarChartProps {
  scores: AttributeScores;
}

function RadarChart({ scores }: RadarChartProps) {
  const n = DIMENSIONS.length;
  const angleStep = 360 / n;

  // Build axis endpoints
  const axes = DIMENSIONS.map((_, i) => polar(i * angleStep, MAX_RADIUS));

  // Build ring polygons
  const rings = Array.from({ length: RINGS }, (_, ri) => {
    const r = ((ri + 1) / RINGS) * MAX_RADIUS;
    return DIMENSIONS.map((_, i) => {
      const { x, y } = polar(i * angleStep, r);
      return `${x},${y}`;
    }).join(" ");
  });

  // Build score polygon
  const scorePoints = DIMENSIONS.map(({ key }, i) => {
    const { x, y } = polar(i * angleStep, scoreToRadius(scores[key]));
    return `${x},${y}`;
  }).join(" ");

  // Label positions (slightly outside MAX_RADIUS)
  const labelPositions = DIMENSIONS.map(({ label, icon }, i) => {
    const { x, y } = polar(i * angleStep, MAX_RADIUS + 22);
    return { label, icon, x, y };
  });

  return (
    <View style={styles.chartContainer}>
      <Svg width={CHART_SIZE} height={CHART_SIZE}>
        {/* Grid rings */}
        {rings.map((pts, i) => (
          <Polygon
            key={`ring-${i}`}
            points={pts}
            fill="none"
            stroke={colors.border.subtle}
            strokeWidth={1}
          />
        ))}

        {/* Axis spokes */}
        {axes.map(({ x, y }, i) => (
          <Line
            key={`axis-${i}`}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke={colors.border.subtle}
            strokeWidth={1}
          />
        ))}

        {/* Score polygon fill */}
        <Polygon
          points={scorePoints}
          fill={colors.brand.primary + "30"}
          stroke={colors.brand.primary}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Score dots */}
        {DIMENSIONS.map(({ key }, i) => {
          const { x, y } = polar(i * angleStep, scoreToRadius(scores[key]));
          return (
            <Circle
              key={`dot-${key}`}
              cx={x}
              cy={y}
              r={4}
              fill={colors.brand.primary}
            />
          );
        })}

        {/* Axis labels */}
        {labelPositions.map(({ label, x, y }) => (
          <SvgText
            key={label}
            x={x}
            y={y + 4}
            textAnchor="middle"
            fontSize={10}
            fill={colors.ink.normal}
            fontWeight="500"
          >
            {label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Score pill row
// ─────────────────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return colors.match.excellent;
  if (score >= 60) return colors.match.good;
  if (score >= 40) return colors.match.fair;
  return colors.match.poor;
}

interface ScorePillsProps {
  scores: AttributeScores;
}

function ScorePills({ scores }: ScorePillsProps) {
  return (
    <View style={styles.pillRow}>
      {DIMENSIONS.map(({ key, label, icon }) => (
        <View key={key} style={styles.pill}>
          <Text style={styles.pillIcon}>{icon}</Text>
          <Text style={styles.pillLabel}>{label}</Text>
          <View
            style={[
              styles.pillScore,
              {
                backgroundColor: scoreColor(scores[key]) + "20",
                borderColor: scoreColor(scores[key]) + "60",
              },
            ]}
          >
            <Text
              style={[styles.pillScoreText, { color: scoreColor(scores[key]) }]}
            >
              {scores[key]}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main exported section
// ─────────────────────────────────────────────────────────────────────────────

interface MatchBreakdownSectionProps {
  resort: Resort;
  prefs: NormalizedPreferences;
}

/**
 * Shows why this resort was recommended — radar chart, score pills, plain-English reasons.
 */
export function MatchBreakdownSection({
  resort,
  prefs,
}: MatchBreakdownSectionProps) {
  const scores = useMemo(() => calculateScores(resort, prefs), [resort, prefs]);
  const reasons = useMemo(
    () => generateExplanations(resort, scores, prefs),
    [resort, scores, prefs],
  );

  const overallScore = useMemo(() => {
    const vals = Object.values(scores);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [scores]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Why This Resort?</Text>

      {/* Overall score badge */}
      <View style={styles.overallRow}>
        <View
          style={[
            styles.overallBadge,
            { backgroundColor: scoreColor(overallScore) + "15" },
          ]}
        >
          <Text
            style={[styles.overallScore, { color: scoreColor(overallScore) }]}
          >
            {overallScore}
          </Text>
          <Text style={styles.overallLabel}>/ 100 match</Text>
        </View>
        <Text style={styles.overallCaption}>
          Scored across 5 dimensions from your preferences
        </Text>
      </View>

      {/* Radar chart */}
      <RadarChart scores={scores} />

      {/* Score pills */}
      <ScorePills scores={scores} />

      {/* Plain-English reasons */}
      <View style={styles.reasonsBox}>
        <Text style={styles.reasonsHeading}>This matched because</Text>
        {reasons.map((reason, i) => (
          <View key={i} style={styles.reasonRow}>
            <Icon
              name="check"
              size={14}
              color={colors.sentiment.success}
              strokeWidth={2.5}
            />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ))}
      </View>

      {/* Plain-language algorithm note */}
      <View style={styles.algorithmNote}>
        <Text style={styles.algorithmNoteTitle}>How scoring works</Text>
        <Text style={styles.algorithmNoteText}>
          Your preferences (skill, budget, snow importance, vibe, and
          activities) are each scored against this resort on a 0–100 scale. The
          scores are then combined using a weighted sum — with your
          highest-priority factors counting more — to produce a single match
          percentage. Think of it as collapsing five dimensions of compatibility
          into one number.
        </Text>
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
    color: colors.ink.rich,
    marginBottom: spacing.md,
  },
  // ── Overall score ──
  overallRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  overallBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  overallScore: {
    ...typography.h1,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "800",
  },
  overallLabel: {
    ...typography.bodySmall,
    color: colors.ink.normal,
  },
  overallCaption: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.ink.normal,
  },
  // ── Chart ──
  chartContainer: {
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  // ── Pills ──
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  pillIcon: {
    fontSize: 12,
  },
  pillLabel: {
    ...typography.caption,
    color: colors.ink.normal,
  },
  pillScore: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  pillScoreText: {
    ...typography.caption,
    fontWeight: "700",
  },
  // ── Reasons ──
  reasonsBox: {
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  reasonsHeading: {
    ...typography.bodyMedium,
    color: colors.ink.rich,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  reasonText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.ink.rich,
  },
  // ── Algorithm note ──
  algorithmNote: {
    backgroundColor: colors.surface.tertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.primary,
  },
  algorithmNoteTitle: {
    ...typography.labelSmall,
    color: colors.brand.primaryStrong,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  algorithmNoteText: {
    ...typography.bodySmall,
    color: colors.ink.normal,
    lineHeight: 18,
  },
});

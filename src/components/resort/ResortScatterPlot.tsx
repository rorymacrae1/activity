/**
 * ResortScatterPlot
 *
 * Interactive 2D scatter plot of all resorts, projected via PCA onto two
 * unlabelled dimensions derived from the 5 scoring axes (skill/budget/vibe/
 * activity/snow).  Dots are colour-coded by match score.
 *
 * Tap a dot to highlight it and reveal a summary panel at the bottom.
 */

import { useCallback, useMemo, useState, Fragment } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";
import { router } from "expo-router";
import type { Resort } from "@/types/resort";
import type { NormalizedPreferences } from "@/types/preferences";
import {
  computePlotPoints,
  scoreColor,
  scoreTierLabel,
  type PlotPoint,
} from "@services/recommendation/pca";
import { Text } from "@components/ui/Text";
import { Icon } from "@components/ui/Icon";
import { colors, spacing, radius } from "@theme";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Fraction of canvas width/height reserved as padding on each side */
const CANVAS_PADDING = 0.08;
const DOT_RADIUS_MIN = 5;
const DOT_RADIUS_MAX = 9;
const DOT_RADIUS_SELECTED = 11;
const DOT_RADIUS_TOP_PICK = 10;

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND = [
  { label: "Excellent (≥80)", color: colors.match.excellent },
  { label: "Good (≥60)", color: colors.match.good },
  { label: "Fair (≥40)", color: colors.match.fair },
  { label: "Poor (<40)", color: colors.match.poor },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapToCanvas(
  px: number,
  py: number,
  w: number,
  h: number,
): { cx: number; cy: number } {
  const padX = w * CANVAS_PADDING;
  const padY = h * CANVAS_PADDING;
  return {
    cx: padX + px * (w - padX * 2),
    cy: padY + py * (h - padY * 2),
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResortScatterPlotProps {
  resorts: Resort[];
  prefs: NormalizedPreferences;
  /** Active search query — non-matching dots are muted */
  query?: string;
  /** IDs of resorts matching the current search filter */
  filterIds?: Set<string>;
  /** IDs of the user's top recommended resorts — highlighted with a ring */
  topPickIds?: string[];
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface PanelProps {
  point: PlotPoint | null;
  onClose: () => void;
}

function SelectedPanel({ point, onClose }: PanelProps) {
  const handleGoToResort = useCallback(() => {
    if (!point) return;
    onClose();
    router.push({
      pathname: "/(main)/resort/[id]",
      params: { id: point.id },
    });
  }, [point, onClose]);

  if (!point) return null;

  const color = scoreColor(point.score);
  const tierLabel = scoreTierLabel(point.score);

  return (
    <View style={panel.container}>
      {/* Header */}
      <View style={panel.header}>
        <View style={panel.headerLeft}>
          <Text style={panel.resortName} numberOfLines={1}>
            {point.name}
          </Text>
          <Text style={panel.location}>{point.country}</Text>
        </View>

        {/* Score badge */}
        <View style={[panel.badge, { backgroundColor: color + "20" }]}>
          <Text style={[panel.badgeScore, { color }]}>{point.score}</Text>
          <Text style={[panel.badgeTier, { color }]}>{tierLabel}</Text>
        </View>

        {/* Close */}
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Dismiss resort panel"
          style={panel.closeBtn}
        >
          <Icon name="x" size={16} color={colors.ink.muted} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Score chips row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={panel.chipsRow}
      >
        {(
          [
            { label: "Skill", val: point.scores.skill },
            { label: "Budget", val: point.scores.budget },
            { label: "Vibe", val: point.scores.vibe },
            { label: "Activity", val: point.scores.activity },
            { label: "Snow", val: point.scores.snow },
          ] as const
        ).map(({ label, val }) => (
          <View key={label} style={panel.chip}>
            <Text style={panel.chipLabel}>{label}</Text>
            <Text style={[panel.chipVal, { color: scoreColor(val) }]}>
              {val}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* CTA */}
      <Pressable
        onPress={handleGoToResort}
        style={({ pressed }) => [panel.cta, pressed && panel.ctaPressed]}
        accessibilityRole="button"
        accessibilityLabel={`View ${point.name} details`}
      >
        <Text style={panel.ctaText}>View resort</Text>
        <Icon
          name="chevron-right"
          size={14}
          color={colors.ink.onBrand}
          strokeWidth={2}
        />
      </Pressable>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * 2D PCA scatter plot of all resorts coloured by match score.
 * Tap a dot to open the resort summary panel.
 */
export function ResortScatterPlot({
  resorts,
  prefs,
  query,
  filterIds,
  topPickIds,
}: ResortScatterPlotProps) {
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasLaidOut, setHasLaidOut] = useState(false);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setCanvasWidth(e.nativeEvent.layout.width);
    setCanvasHeight(e.nativeEvent.layout.height);
    setHasLaidOut(true);
  }, []);

  const points: PlotPoint[] = useMemo(
    () => computePlotPoints(resorts, prefs),
    [resorts, prefs],
  );

  const selectedPoint = useMemo(
    () => points.find((p) => p.id === selectedId) ?? null,
    [points, selectedId],
  );

  const handleDotPress = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeselect = useCallback(() => setSelectedId(null), []);

  const topPickSet = useMemo(
    () => new Set(topPickIds ?? []),
    [topPickIds],
  );

  const hasFilter = !!query && (filterIds?.size ?? 0) > 0;

  return (
    <View style={styles.root}>
      {/* ── SVG Canvas ── */}
      <View style={styles.canvasWrapper} onLayout={onLayout}>
        {hasLaidOut && canvasWidth > 0 && canvasHeight > 0 && (
          <Svg
            width={canvasWidth}
            height={canvasHeight}
            accessibilityLabel="Resort comparison scatter chart"
          >
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={colors.canvas.subtle}
              rx={radius.lg}
            />

            {/* Subtle grid lines */}
            {[0.25, 0.5, 0.75].map((frac) => {
              const x = canvasWidth * frac;
              return (
                <Line
                  key={`gx-${frac}`}
                  x1={x}
                  y1={canvasHeight * CANVAS_PADDING}
                  x2={x}
                  y2={canvasHeight * (1 - CANVAS_PADDING)}
                  stroke={colors.border.subtle}
                  strokeWidth={0.75}
                  strokeDasharray="3 4"
                />
              );
            })}
            {[0.25, 0.5, 0.75].map((frac) => {
              const y = canvasHeight * frac;
              return (
                <Line
                  key={`gy-${frac}`}
                  x1={canvasWidth * CANVAS_PADDING}
                  y1={y}
                  x2={canvasWidth * (1 - CANVAS_PADDING)}
                  y2={y}
                  stroke={colors.border.subtle}
                  strokeWidth={0.75}
                  strokeDasharray="3 4"
                />
              );
            })}

            {/* Axis labels — corrected to reflect actual PC1/PC2 semantics */}
            <SvgText
              x={canvasWidth * CANVAS_PADDING}
              y={canvasHeight - 6}
              fontSize={9}
              fill={colors.ink.faint}
            >
              ← Lower match
            </SvgText>
            <SvgText
              x={canvasWidth * (1 - CANVAS_PADDING) - 72}
              y={canvasHeight - 6}
              fontSize={9}
              fill={colors.ink.faint}
            >
              Better overall match →
            </SvgText>
            <SvgText
              x={4}
              y={canvasHeight * CANVAS_PADDING + 6}
              fontSize={9}
              fill={colors.ink.faint}
            >
              ↑ Technical
            </SvgText>
            <SvgText
              x={4}
              y={canvasHeight * (1 - CANVAS_PADDING) - 4}
              fontSize={9}
              fill={colors.ink.faint}
            >
              ↓ Easy-going
            </SvgText>

            {/* Dots — unselected first so selected renders on top */}
            {points
              .filter((p) => p.id !== selectedId)
              .map((p) => {
                const { cx, cy } = mapToCanvas(
                  p.px,
                  p.py,
                  canvasWidth,
                  canvasHeight,
                );
                const fill = scoreColor(p.score);
                const isTopPick = topPickSet.has(p.id);
                const isFiltered = hasFilter && !filterIds!.has(p.id);
                // Dot radius scales with match score (5–9px); top picks are always largest
                const r = isTopPick
                  ? DOT_RADIUS_TOP_PICK
                  : Math.round(
                      DOT_RADIUS_MIN +
                        (p.score / 100) * (DOT_RADIUS_MAX - DOT_RADIUS_MIN),
                    );
                return (
                  <Fragment key={p.id}>
                    {/* Top-pick halo ring */}
                    {isTopPick && (
                      <Circle
                        cx={cx}
                        cy={cy}
                        r={DOT_RADIUS_TOP_PICK + 5}
                        fill={fill}
                        fillOpacity={0.2}
                      />
                    )}
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={fill}
                      fillOpacity={isFiltered ? 0.12 : 0.88}
                      stroke={colors.surface.primary}
                      strokeWidth={isTopPick ? 2 : 1.5}
                      onPress={() => handleDotPress(p.id)}
                      accessibilityLabel={`${p.name}, ${scoreTierLabel(p.score)}`}
                    />
                  </Fragment>
                );
              })}

            {/* Selected dot — with ring */}
            {selectedPoint &&
              (() => {
                const { cx, cy } = mapToCanvas(
                  selectedPoint.px,
                  selectedPoint.py,
                  canvasWidth,
                  canvasHeight,
                );
                const fill = scoreColor(selectedPoint.score);
                return (
                  <>
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={DOT_RADIUS_SELECTED + 5}
                      fill={fill}
                      fillOpacity={0.15}
                    />
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={DOT_RADIUS_SELECTED}
                      fill={fill}
                      stroke={colors.surface.primary}
                      strokeWidth={2}
                      onPress={handleDeselect}
                    />
                  </>
                );
              })()}
          </Svg>
        )}
      </View>

      {/* ── Legend ── */}
      <View style={styles.legendRow}>
        {LEGEND.map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={styles.legendLabel}>{l.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Selected resort panel ── */}
      <SelectedPanel point={selectedPoint} onClose={handleDeselect} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  canvasWrapper: {
    flex: 1,
    minHeight: 260,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: colors.ink.muted,
  },
});

const panel = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
    // Subtle shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  resortName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink.rich,
  },
  location: {
    fontSize: 12,
    color: colors.ink.muted,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    alignItems: "center",
    minWidth: 64,
  },
  badgeScore: {
    fontSize: 18,
    fontWeight: "800",
  },
  badgeTier: {
    fontSize: 10,
    fontWeight: "600",
  },
  closeBtn: {
    padding: spacing.xs,
  },
  chipsRow: {
    gap: spacing.xs,
    flexDirection: "row",
  },
  chip: {
    backgroundColor: colors.canvas.subtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignItems: "center",
    gap: 2,
    minWidth: 52,
  },
  chipLabel: {
    fontSize: 10,
    color: colors.ink.muted,
    fontWeight: "500",
  },
  chipVal: {
    fontSize: 14,
    fontWeight: "700",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink.onBrand,
  },
});

import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius, typography } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import { AnimatedQuizContent } from "@components/onboarding/AnimatedQuizContent";
import type { SkillLevel, TripType, BudgetLevel, FeatureKey } from "@/types/preferences";

// --- Feature pill definitions -------------------------------------------

interface FeaturePill {
  key: FeatureKey;
  label: string;
  impact: string;
}

const FEATURE_PILLS: FeaturePill[] = [
  { key: "ski_in_out",       label: "Ski-in / Ski-out",    impact: "Ski directly to your accommodation door" },
  { key: "catered",          label: "Catered Chalet",      impact: "Full-board chalets with meals included" },
  { key: "snow_park",        label: "Snow Park",           impact: "Freestyle jumps, rails & halfpipe on-piste" },
  { key: "train_accessible", label: "Train Access",        impact: "Reach it from the UK without flying" },
  { key: "high_altitude",    label: "High Altitude",       impact: "Above 2,500m — more reliable snow conditions" },
  { key: "off_piste",        label: "Off-Piste",           impact: "Ungroomed powder & backcountry routes" },
  { key: "family_friendly",  label: "Family Friendly",     impact: "Kids clubs, gentle slopes & family services" },
  { key: "lively_apres",     label: "Lively Après",        impact: "Bars, clubs & a buzzing après scene" },
  { key: "quiet_resort",     label: "Quiet & Uncrowded",   impact: "Fewer crowds and a more relaxed pace" },
  { key: "glacier",          label: "Glacier Skiing",      impact: "Year-round snow above 3,000m" },
];

// --- Helpers -----------------------------------------------------------

const MONTH_LABELS: Record<number, string> = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
  7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
};

const PISTE_COLORS: Record<SkillLevel, string> = {
  beginner: colors.terrain.beginner,
  intermediate: colors.terrain.intermediate,
  red: colors.terrain.red,
  advanced: colors.terrain.advanced,
};

const PISTE_LABELS: Record<SkillLevel, string> = {
  beginner: "Green Runs",
  intermediate: "Blue Cruiser",
  red: "Advanced Intermediate",
  advanced: "Black Diamond",
};

const TRIP_TYPE_LABELS: Record<TripType, string> = {
  solo: "Just me",
  couple: "Couple",
  family: "Family",
  friends: "Friend group",
};

const TRIP_TYPE_ICONS: Record<TripType, string> = {
  solo: "🎿",
  couple: "👫",
  family: "👨‍👩‍👧‍👦",
  friends: "🎉",
};

const BUDGET_LABELS: Record<BudgetLevel, string> = {
  budget: "Value Explorer · £80–120/day",
  mid: "Sweet Spot · £120–180/day",
  premium: "Full Experience · £180–280/day",
  luxury: "No Limits · £280+/day",
};

const CROWD_LABELS: Record<number, string> = {
  1: "Very Quiet", 2: "Quiet", 3: "Moderate", 4: "Lively", 5: "Very Lively",
};

const FOCUS_LABELS: Record<number, string> = {
  1: "Very Family", 2: "Family", 3: "Mixed", 4: "Nightlife", 5: "Very Lively Nightlife",
};

// --- EditLink component ------------------------------------------------

function EditLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Edit this answer"
    >
      <Text
        variant="label"
        style={{ color: colors.brand.primary, fontWeight: "600" }}
      >
        Edit
      </Text>
    </Pressable>
  );
}

// --- SummaryCard component ---------------------------------------------

function SummaryCard({
  label,
  children,
  onEdit,
}: {
  label: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <Text variant="label" style={cardStyles.label}>
          {label}
        </Text>
        <EditLink onPress={onEdit} />
      </View>
      <View style={cardStyles.body}>{children}</View>
    </View>
  );
}

const cardStyles = {
  card: {
    backgroundColor: colors.canvas.default,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  } as const,
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.ink.muted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    fontSize: 11,
  },
  body: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flexWrap: "wrap" as const,
    gap: spacing.xs,
  },
};

// --- Main screen -------------------------------------------------------

export default function ReviewScreen() {
  const {
    tripType,
    groupAbilities,
    budgetLevel,
    regions,
    crowdPreference,
    familyVsNightlife,
    preferredMonths,
    featurePreferences,
    setFeaturePreferences,
  } = usePreferencesStore();

  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  // Localised country names from content
  const countryContent = (content as Record<string, unknown>)["countries"] as
    | Record<string, { name: string; flag: string }>
    | undefined;

  const getCountryDisplay = (id: string) => {
    const entry = countryContent?.[id];
    return entry ? `${entry.flag} ${entry.name}` : id;
  };

  const crowdIndex = Math.round(Math.max(1, Math.min(5, crowdPreference)));
  const focusIndex = Math.round(Math.max(1, Math.min(5, familyVsNightlife)));

  const toggleFeature = (key: FeatureKey) => {
    if (featurePreferences.includes(key)) {
      setFeaturePreferences(featurePreferences.filter((f) => f !== key));
    } else {
      setFeaturePreferences([...featurePreferences, key]);
    }
  };

  return (
    <QuizLayout
      footer={
        <View style={footerStyles.footer}>
          <Button
            label="← Back"
            variant="ghost"
            onPress={() => router.push("/(onboarding)/vibes")}
            style={footerStyles.back}
          />
          <Button
            label="Find My Resorts →"
            onPress={() => router.replace("/(onboarding)/results")}
            style={footerStyles.cta}
            size="prominent"
          />
        </View>
      }
    >
      <AnimatedQuizContent animation="parallax">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            innerStyles.container,
            !isTablet && { paddingHorizontal: hPadding },
          ]}
        >
          {/* Header */}
          <View style={innerStyles.progressRow}>
            <ProgressIndicator current={6} total={6} showLabel />
          </View>

          <View style={innerStyles.header}>
            <Text variant="h2">Your Perfect Trip</Text>
            <Text variant="body" style={{ color: colors.ink.normal }}>
              Here's what you've told us — edit anything before we search
            </Text>
          </View>

          {/* Trip Type */}
          <SummaryCard
            label="Trip Type"
            onEdit={() => router.push("/(onboarding)/trip-type")}
          >
            {tripType ? (
              <>
                <Text variant="bodyLarge" style={summaryStyles.icon}>
                  {TRIP_TYPE_ICONS[tripType]}
                </Text>
                <Text variant="bodyLarge" style={summaryStyles.value}>
                  {TRIP_TYPE_LABELS[tripType]}
                </Text>
              </>
            ) : (
              <Text variant="body" style={summaryStyles.notSet}>
                Not set
              </Text>
            )}
          </SummaryCard>

          {/* Skill Level */}
          <SummaryCard
            label="Skill Level"
            onEdit={() => router.push("/(onboarding)/skill")}
          >
            {groupAbilities.length > 0 ? (
              groupAbilities.map((level) => (
                <View key={level} style={summaryStyles.pileBadge}>
                  <View
                    style={[
                      summaryStyles.pisteDot,
                      { backgroundColor: PISTE_COLORS[level] },
                    ]}
                  />
                  <Text variant="body" style={summaryStyles.value}>
                    {PISTE_LABELS[level]}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="body" style={summaryStyles.notSet}>
                Not set
              </Text>
            )}
          </SummaryCard>

          {/* Budget */}
          <SummaryCard
            label="Budget"
            onEdit={() => router.push("/(onboarding)/budget")}
          >
            {budgetLevel ? (
              <Text variant="bodyLarge" style={summaryStyles.value}>
                {BUDGET_LABELS[budgetLevel]}
              </Text>
            ) : (
              <Text variant="body" style={summaryStyles.notSet}>
                Not set
              </Text>
            )}
          </SummaryCard>

          {/* Regions */}
          <SummaryCard
            label="Destinations"
            onEdit={() => router.push("/(onboarding)/region")}
          >
            {regions.length > 0 ? (
              regions.map((id) => (
                <View key={id} style={summaryStyles.tag}>
                  <Text variant="label" style={summaryStyles.tagText}>
                    {getCountryDisplay(id)}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="body" style={summaryStyles.notSet}>
                Not set
              </Text>
            )}
          </SummaryCard>

          {/* Vibes */}
          <SummaryCard
            label="Vibe & Season"
            onEdit={() => router.push("/(onboarding)/vibes")}
          >
            <View style={summaryStyles.vibesCol}>
              <View style={summaryStyles.vibeRow}>
                <Text variant="label" style={summaryStyles.vibeKey}>
                  Crowd
                </Text>
                <Text variant="body" style={summaryStyles.value}>
                  {CROWD_LABELS[crowdIndex] ?? "Moderate"}
                </Text>
              </View>
              <View style={summaryStyles.vibeRow}>
                <Text variant="label" style={summaryStyles.vibeKey}>
                  Focus
                </Text>
                <Text variant="body" style={summaryStyles.value}>
                  {FOCUS_LABELS[focusIndex] ?? "Mixed"}
                </Text>
              </View>
              {preferredMonths.length > 0 && (
                <View style={summaryStyles.vibeRow}>
                  <Text variant="label" style={summaryStyles.vibeKey}>
                    Months
                  </Text>
                  <Text variant="body" style={summaryStyles.value}>
                    {preferredMonths
                      .sort((a, b) => a - b)
                      .map((m) => MONTH_LABELS[m])
                      .join(", ")}
                  </Text>
                </View>
              )}
            </View>
          </SummaryCard>

          {/* Must-Haves — feature preference pills */}
          <View style={pillStyles.section}>
            <View style={pillStyles.header}>
              <Text variant="h3" style={pillStyles.heading}>
                Anything you must have?
              </Text>
              <Text variant="body" style={pillStyles.subheading}>
                We'll prioritise resorts that tick these boxes
              </Text>
            </View>
            <View style={pillStyles.grid}>
              {FEATURE_PILLS.map((pill) => {
                const active = featurePreferences.includes(pill.key);
                return (
                  <Pressable
                    key={pill.key}
                    onPress={() => toggleFeature(pill.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={pill.label}
                    style={[
                      pillStyles.pill,
                      active ? pillStyles.pillActive : pillStyles.pillInactive,
                    ]}
                  >
                    <Text
                      style={[
                        pillStyles.pillLabel,
                        active && pillStyles.pillLabelActive,
                      ]}
                    >
                      {pill.label}
                    </Text>
                    <Text
                      style={[
                        pillStyles.pillImpact,
                        active && pillStyles.pillImpactActive,
                      ]}
                    >
                      {pill.impact}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {featurePreferences.length > 0 && (
              <Pressable
                onPress={() => setFeaturePreferences([])}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Clear all must-haves"
                style={pillStyles.clearRow}
              >
                <Text style={pillStyles.clearText}>Clear all</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </AnimatedQuizContent>
    </QuizLayout>
  );
}

// --- Styles -----------------------------------------------------------

const innerStyles = {
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  } as const,
  progressRow: {
    marginBottom: spacing.md,
  } as const,
  header: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  } as const,
};

const footerStyles = {
  footer: {
    flexDirection: "row" as const,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  back: {
    flex: 1,
  } as const,
  cta: {
    flex: 2,
  } as const,
};

const summaryStyles = {
  icon: {
    fontSize: 22,
  } as const,
  value: {
    color: colors.ink.rich,
    fontWeight: "600" as const,
  },
  notSet: {
    color: colors.ink.muted,
  } as const,
  pileBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  pisteDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  } as const,
  tag: {
    backgroundColor: colors.canvas.inset,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  } as const,
  tagText: {
    color: colors.ink.rich,
  } as const,
  vibesCol: {
    flex: 1,
    gap: spacing.xs,
  } as const,
  vibeRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
  },
  vibeKey: {
    color: colors.ink.muted,
    width: 56,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    fontSize: 10,
  },
};

const pillStyles = {
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  } as const,
  header: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  } as const,
  heading: {
    color: colors.ink.rich,
  } as const,
  subheading: {
    color: colors.ink.muted,
  } as const,
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
  } as const,
  pill: {
    flexDirection: "column" as const,
    alignItems: "flex-start" as const,
    gap: spacing.xxs,
    width: "48%" as const,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
  } as const,
  pillInactive: {
    backgroundColor: colors.surface.primary,
    borderColor: colors.border.default,
  } as const,
  pillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  } as const,
  pillLabel: {
    ...typography.labelSmall,
    color: colors.ink.rich,
    fontWeight: "600" as const,
  } as const,
  pillLabelActive: {
    color: colors.ink.onBrand,
    fontWeight: "700" as const,
  } as const,
  pillImpact: {
    ...typography.caption,
    color: colors.ink.muted,
    lineHeight: 16,
  } as const,
  pillImpactActive: {
    color: colors.ink.onBrand,
    opacity: 0.85,
  } as const,
  clearRow: {
    marginTop: spacing.sm,
    alignSelf: "flex-start" as const,
  } as const,
  clearText: {
    ...typography.bodySmall,
    color: colors.ink.muted,
    textDecorationLine: "underline" as const,
  } as const,
};

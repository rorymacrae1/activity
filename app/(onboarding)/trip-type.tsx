import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { usePreferencesStore } from "@stores/preferences";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";
import { colors, spacing, radius } from "@theme";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { QuizLayout } from "@components/onboarding/QuizLayout";
import { ProgressIndicator } from "@components/onboarding/ProgressIndicator";
import type { TripType } from "@/types/preferences";

export default function TripTypeScreen() {
  const { tripType, setTripType } = usePreferencesStore();
  const { isTablet, hPadding } = useLayout();
  const content = useContent();

  const OPTIONS: Array<{ value: TripType; icon: string }> = [
    { value: "solo", icon: "🧑" },
    { value: "couple", icon: "💑" },
    { value: "family", icon: "👨‍👩‍👧" },
    { value: "friends", icon: "👥" },
  ];

  return (
    <QuizLayout>
      <View
        style={[
          styles.inner,
          { paddingHorizontal: isTablet ? spacing.xl : hPadding },
        ]}
      >
        <ProgressIndicator current={1} total={5} showLabel />

        <View style={styles.header}>
          <Text variant="h2">{content.onboarding.tripType.title}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {content.onboarding.tripType.subtitle}
          </Text>
        </View>

        <View style={[styles.options, isTablet && styles.optionsRow]}>
          {OPTIONS.map((opt) => {
            const optContent = content.onboarding.tripType.options[opt.value];
            const active = tripType === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[
                  styles.option,
                  active && styles.optionActive,
                  isTablet && styles.optionTablet,
                ]}
                onPress={() => setTripType(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${optContent.title}: ${optContent.description}`}
              >
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <View style={styles.optionText}>
                  <Text
                    variant="h4"
                    color={active ? colors.primary : colors.text.primary}
                  >
                    {optContent.title}
                  </Text>
                  <Text variant="bodySmall" color={colors.text.secondary}>
                    {optContent.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            label={`${content.onboarding.tripType.next} →`}
            onPress={() => tripType && router.push("/(onboarding)/skill")}
            disabled={!tripType}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, paddingVertical: spacing.md },
  header: { marginTop: spacing.md, marginBottom: spacing.lg, gap: spacing.xs },
  options: { flex: 1, gap: spacing.md, justifyContent: "center" },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.background.secondary,
    gap: spacing.md,
  },
  optionTablet: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  optionIcon: { fontSize: 32 },
  optionText: { flex: 1 },
  footer: { paddingTop: spacing.md, paddingBottom: spacing.sm },
});

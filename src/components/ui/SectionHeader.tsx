import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Text } from "./Text";
import { colors, spacing, webStyles } from "@theme";

interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional eyebrow text above title */
  eyebrow?: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Optional action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Section header with refined typography hierarchy.
 *
 * @example
 * <SectionHeader title="Your Matches" />
 * <SectionHeader
 *   eyebrow="Featured"
 *   title="Top Picks"
 *   subtitle="Based on your preferences"
 *   action={{ label: "See all", onPress: handleSeeAll }}
 * />
 */
export function SectionHeader({
  title,
  eyebrow,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {eyebrow ? (
          <Text variant="overline" color="muted" style={styles.eyebrow}>
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="h2" color="rich">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" color="muted" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.actionPressed,
            Platform.OS === "web" && webStyles.clickable,
          ]}
        >
          <Text variant="label" color="brand">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
  },
  content: {
    flex: 1,
    gap: spacing["2xs"],
  },
  eyebrow: {
    marginBottom: spacing["2xs"],
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  action: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.md,
  },
  actionPressed: {
    opacity: 0.7,
  },
});

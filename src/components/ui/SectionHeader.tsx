import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "./Text";
import { colors, spacing, typography } from "@theme";

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Section title with optional right-side text action.
 *
 * @example
 * <SectionHeader title="Your Matches" action={{ label: "See all", onPress: handleSeeAll }} />
 */
export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text variant="h3" style={styles.title}>
        {title}
      </Text>
      {action ? (
        <Pressable onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label}>
          <Text style={[typography.bodySmall, { color: colors.primary }]}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  title: {
    flex: 1,
  },
});

import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { colors, spacing } from "@theme";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Consistent empty / error state with icon, copy, and optional CTA.
 *
 * @example
 * <EmptyState
 *   icon="🔖"
 *   title="No saved resorts"
 *   message="Tap the heart on any resort to save it."
 *   action={{ label: "Discover Resorts", onPress: () => router.push("/(main)") }}
 * />
 */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text variant="h3" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" align="center" color={colors.text.secondary} style={styles.message}>
        {message}
      </Text>
      {action ? (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="primary"
          size="md"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  message: {
    textAlign: "center",
  },
  action: {
    marginTop: spacing.lg,
  },
});

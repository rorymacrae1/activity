import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { spacing } from "@theme";
import { colors } from "@theme/colors";

interface EmptyStateProps {
  /** Icon name from the Icon registry */
  icon: IconName;
  /** Primary message */
  title: string;
  /** Supporting message */
  message: string;
  /** Optional call-to-action */
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Refined empty state with generous whitespace.
 *
 * Uses calm, luxury aesthetic — not sad or apologetic.
 *
 * @example
 * <EmptyState
 *   icon="bookmark"
 *   title="No saved resorts yet"
 *   message="Resorts you save will appear here for easy access."
 *   action={{ label: "Explore resorts", onPress: () => router.push("/(main)") }}
 * />
 */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon
          name={icon}
          size={48}
          color={colors.ink.muted}
          strokeWidth={1.25}
        />
      </View>
      <Text variant="h2" align="center" color="rich" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" align="center" color="muted" style={styles.message}>
        {message}
      </Text>
      {action ? (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="primary"
          size="standard"
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
    padding: spacing["3xl"],
    gap: spacing.md,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  message: {
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.xl,
    alignSelf: "center",
  },
});

import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors, spacing } from "@theme";

interface LoadingStateProps {
  message?: string;
  icon?: string;
}

/**
 * Full-screen loading indicator with optional message.
 *
 * @example
 * <LoadingState icon="🎿" message="Finding your perfect resorts..." />
 */
export function LoadingState({ message, icon }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text variant="body" color={colors.text.secondary} align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  message: {
    marginTop: spacing.xs,
  },
});

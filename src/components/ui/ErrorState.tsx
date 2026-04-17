import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { spacing } from "@theme";
import { colors } from "@theme/colors";

interface ErrorStateProps {
  /** Primary message shown to the user */
  message?: string;
  /** Optional detail (e.g. technical reason) */
  detail?: string;
  /** Retry callback — renders a "Try Again" button when provided */
  onRetry?: () => void;
}

/**
 * Full-screen error state for when a data load fails.
 * Matches LoadingState layout — swap one for the other.
 *
 * @example
 * <ErrorState
 *   message="Couldn't load resorts"
 *   onRetry={handleRetry}
 * />
 */
export function ErrorState({
  message = "Something went wrong",
  detail,
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon
          name="alert-triangle"
          size={48}
          color={colors.sentiment.warning}
          strokeWidth={1.5}
        />
      </View>
      <Text variant="h3" align="center" style={styles.message}>
        {message}
      </Text>
      {detail ? (
        <Text variant="bodySmall" align="center" color="muted" style={styles.detail}>
          {detail}
        </Text>
      ) : null}
      {onRetry ? (
        <Button
          label="Try Again"
          onPress={onRetry}
          variant="secondary"
          size="standard"
          style={styles.button}
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
  iconWrap: {
    marginBottom: spacing.lg,
  },
  message: {
    marginBottom: spacing.xs,
  },
  detail: {
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.xl,
    alignSelf: "center",
  },
});

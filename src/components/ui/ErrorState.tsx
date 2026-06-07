import { View } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { Icon } from "./Icon";
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
    <View className="flex-1 items-center justify-center p-12 gap-3">
      <View className="mb-5">
        <Icon
          name="alert-triangle"
          size={48}
          color={colors.sentiment.warning}
          strokeWidth={1.5}
        />
      </View>
      <Text variant="h3" align="center" className="mb-1">
        {message}
      </Text>
      {detail ? (
        <Text variant="bodySmall" align="center" color="muted" className="max-w-[280px]">
          {detail}
        </Text>
      ) : null}
      {onRetry ? (
        <Button
          label="Try Again"
          onPress={onRetry}
          variant="secondary"
          size="standard"
          className="mt-6 self-center"
        />
      ) : null}
    </View>
  );
}

import * as Sentry from "@sentry/react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

/**
 * Initializes Sentry crash reporting.
 * Call once at app startup before any other code runs.
 * DSN is read from EXPO_PUBLIC_SENTRY_DSN env var — silent no-op if not set.
 */
export function initSentry(): void {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    attachScreenshot: true,
    debug: __DEV__,
    enabled: !__DEV__,
  });
}

export { Sentry };

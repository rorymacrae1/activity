/**
 * SyncErrorObserver
 *
 * Mounts once inside ToastProvider. Watches both the favorites and
 * preferences stores for sync errors and shows a toast whenever a new
 * error appears, then clears it so it only fires once per failure.
 */

import { useEffect, useRef } from "react";
import { useFavoritesStore } from "@stores/favorites";
import { usePreferencesStore } from "@stores/preferences";
import { useToast } from "@components/ui/Toast";

export function SyncErrorObserver() {
  const { showToast } = useToast();

  const favoritesError = useFavoritesStore((s) => s.syncError);
  const prefsError = usePreferencesStore((s) => s.syncError);

  // Track which error we last reported so we don't toast twice on re-renders
  const lastFavError = useRef<string | null>(null);
  const lastPrefsError = useRef<string | null>(null);

  useEffect(() => {
    if (favoritesError && favoritesError !== lastFavError.current) {
      lastFavError.current = favoritesError;
      showToast({
        type: "error",
        message: "Couldn't sync your saved resorts. Changes are saved locally.",
        duration: 4000,
      });
      // Clear the error in the store so it won't re-trigger on unrelated renders
      useFavoritesStore.setState({ syncError: null });
    }
  }, [favoritesError, showToast]);

  useEffect(() => {
    if (prefsError && prefsError !== lastPrefsError.current) {
      lastPrefsError.current = prefsError;
      showToast({
        type: "error",
        message: "Couldn't sync your preferences. Changes are saved locally.",
        duration: 4000,
      });
      usePreferencesStore.setState({ syncError: null });
    }
  }, [prefsError, showToast]);

  return null;
}

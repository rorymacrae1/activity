import { useEffect } from "react";
import { Image } from "expo-image";
import type { Resort } from "@/types/resort";

/**
 * Prefetch hero images for a list of resorts into expo-image's disk cache.
 *
 * Call this on screens that know which resorts will be shown next (e.g.
 * results, favorites, discover) so images are already cached before the
 * user taps through to the detail page.
 *
 * No-ops for empty arrays, falsy URIs, or already-cached images.
 */
export function usePrefetchImages(resorts: Resort[]): void {
  useEffect(() => {
    if (resorts.length === 0) return;

    const uris = resorts.map((r) => r.assets.heroImage).filter(Boolean);

    if (uris.length === 0) return;

    Image.prefetch(uris);
  }, [resorts]);
}

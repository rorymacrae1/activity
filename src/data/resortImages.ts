/**
 * Curated resort hero image mapping.
 *
 * We maintain a named pool of Unsplash ski/alpine photos and assign each
 * resort a consistent image using a deterministic name hash so the same
 * resort always gets the same photo.
 *
 * Photo IDs are Unsplash IDs. Format:
 *   https://images.unsplash.com/photo-{id}?w=800&q=80&auto=format&fit=crop
 */

const SKI_PHOTO_POOL: string[] = [
  "1518544866330-4e716499f800", // Alpine lift station + blue sky
  "1488771458710-d11d31c0e31c", // Snow-capped Matterhorn village
  "1462275646964-a0e3386b89fa", // Wide piste with ski field
  "1451772741724-d20990422508", // Dramatic mountain bowl
  "1547581849426-a7ccd4258a39", // Black run through trees
  "1531971589569-0d9370010891", // Sun-drenched groomed slope
  "1476310517036-011959e2aedc", // Alpine resort village in snow
  "1512302048498-2e562b11e1be", // High-altitude mountain panorama
  "1505739818593-0c37a42cd3b1", // Blue-sky ski horizon
  "1484821582019-ea4ad8cf866a", // Sunset over snowy peaks
  "1554188248-986adbb73be4", // Ski boots & powder snow
  "1586276387815-9b3c8f31c5b6", // Gondola over white valley
];

/**
 * Simple deterministic hash so every resort always maps to the same photo.
 */
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Returns a Unsplash hero image URL for the given resort name.
 * Deterministic: the same name always returns the same URL.
 */
export function getResortHeroImage(resortName: string): string {
  const idx = hashName(resortName) % SKI_PHOTO_POOL.length;
  return `https://images.unsplash.com/photo-${SKI_PHOTO_POOL[idx]}?w=800&q=80&auto=format&fit=crop`;
}

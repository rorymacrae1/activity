/**
 * Fallback resort hero image mapping.
 *
 * Primary hero images live in the Supabase `resort.hero_image` column and
 * are served from Supabase Storage (self-hosted CDN we control).
 *
 * This pool is only reached when a resort row has a NULL hero_image.
 * We keep a small set of generic alpine Unsplash photos and assign each
 * resort a consistent image via a deterministic name hash.
 *
 * Photo IDs are Unsplash IDs. Format:
 *   https://images.unsplash.com/photo-{id}?w=800&q=80&auto=format&fit=crop
 */

const SKI_PHOTO_POOL: string[] = [
  "1518544866330-4e716499f800", // Alpine lift station + blue sky
  "1551698618-1dfe5d97d256", // Snow-covered alpine village
  "1462275646964-a0e3386b89fa", // Wide piste with ski field
  "1451772741724-d20990422508", // Dramatic mountain bowl
  "1520443240718-fce21901db79", // Fresh powder mountain slope
  "1486911278844-a81c5267e227", // Mountain peaks panorama
  "1542202229-7d93c33f5d07", // Snowy alpine forest trail
  "1416339684178-3a239570f315", // Mountain range winter vista
  "1419242902214-272b3f66ee7a", // Ski resort overview
  "1517483000871-1dbf64a6e1c6", // Snowy peak with clouds
  "1554188248-986adbb73be4", // Ski boots & powder snow
  "1605540436563-5bca919ae766", // Winter mountain landscape
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
 * Returns a fallback hero image URL for the given resort name.
 * Only called when the resort's `hero_image` column is NULL.
 * Deterministic: the same name always returns the same URL.
 */
export function getResortHeroImage(resortName: string): string {
  const idx = hashName(resortName) % SKI_PHOTO_POOL.length;
  return `https://images.unsplash.com/photo-${SKI_PHOTO_POOL[idx]}?w=800&q=80&auto=format&fit=crop`;
}

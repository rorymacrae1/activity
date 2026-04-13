/**
 * Populate hero_image in the Supabase resort table using the Unsplash Search API.
 *
 * Searches "{resort name} ski resort" for each resort without an image,
 * picks the first result oriented landscape, and writes the URL back to Supabase.
 *
 * Unsplash images are served via their CDN and do not require an API key at
 * display time — only this one-shot script needs the key.
 *
 * Usage:
 *   UNSPLASH_ACCESS_KEY=your-access-key \
 *   SUPABASE_SERVICE_KEY=your-service-role-key \
 *   node scripts/update-resort-images.mjs
 *
 * Optional flags:
 *   --force   Re-fetch images even for resorts that already have one
 *   --dry-run Print what would be updated without writing to Supabase
 *
 * Get keys from:
 *   Unsplash: https://unsplash.com/oauth/applications
 *   Supabase: https://supabase.com/dashboard/project/xhfjeoynmcwaslzjxhdt/settings/api
 */

import { createClient } from "@supabase/supabase-js";

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://xhfjeoynmcwaslzjxhdt.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");

// Use Unsplash's "raw" URL — no size params baked in, so the app can
// append its own sizing query string without creating a malformed URL.
const IMAGE_SIZE = "raw";

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌  Missing SUPABASE_SERVICE_KEY");
  process.exit(1);
}
if (!UNSPLASH_ACCESS_KEY) {
  console.error("❌  Missing UNSPLASH_ACCESS_KEY");
  console.error(
    "   Create a free application at https://unsplash.com/oauth/applications",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Unsplash search ──────────────────────────────────────────────────────────

/**
 * Search Unsplash for a ski image matching the given resort name.
 * Returns the best result's raw CDN URL, or null if nothing suitable found.
 *
 * Rate limit: 50 requests/hour on the demo tier. This script processes
 * one resort per second to stay well within limits.
 */
async function fetchUnsplashImage(resortName) {
  const query = encodeURIComponent(`${resortName} ski resort`);
  const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=5&orientation=landscape&content_filter=high`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Unsplash API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const results = data.results ?? [];

  if (results.length === 0) {
    // Fall back to a generic "ski" search if the resort name returns nothing
    return fetchUnsplashFallback();
  }

  // Prefer results whose descriptions mention skiing or mountains
  const prioritised = results.find(
    (r) =>
      r.description?.toLowerCase().match(/ski|alpine|mountain|snow|slope/) ||
      r.alt_description?.toLowerCase().match(/ski|alpine|mountain|snow|slope/),
  );
  const chosen = prioritised ?? results[0];

  return chosen.urls[IMAGE_SIZE];
}

// Cache the generic fallback URL so we only spend one API call on it
// regardless of how many resorts return no specific results.
let cachedFallbackUrl = null;

/**
 * Generic ski fallback used when no resort-specific result is found.
 * Result is cached after the first successful call.
 */
async function fetchUnsplashFallback() {
  if (cachedFallbackUrl) return cachedFallbackUrl;

  const url = `https://api.unsplash.com/search/photos?query=ski+resort+mountain+snow&per_page=1&orientation=landscape&content_filter=high`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  cachedFallbackUrl = data.results?.[0]?.urls?.[IMAGE_SIZE] ?? null;
  return cachedFallbackUrl;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🏔  PisteWise resort image updater`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"} | Force: ${FORCE}\n`);

  // 1. Fetch all resorts from Supabase
  const { data: resorts, error } = await supabase
    .from("resort")
    .select("id, name, hero_image")
    .order("name");

  if (error) {
    console.error("❌  Failed to fetch resorts:", error.message);
    process.exit(1);
  }

  console.log(`   Found ${resorts.length} resorts in database\n`);

  const toProcess = FORCE ? resorts : resorts.filter((r) => !r.hero_image);

  if (toProcess.length === 0) {
    console.log(
      "✅  All resorts already have images. Use --force to re-fetch.",
    );
    return;
  }

  console.log(
    `   Processing ${toProcess.length} resort${toProcess.length !== 1 ? "s" : ""}...\n`,
  );

  let updated = 0;
  let failed = 0;

  for (const resort of toProcess) {
    try {
      const imageUrl = await fetchUnsplashImage(resort.name);

      if (!imageUrl) {
        console.warn(`   ⚠️  No image found for "${resort.name}"`);
        failed++;
        continue;
      }

      // Strip Unsplash API query params (ixid, ixlib, etc.) before storing.
      // The app mapper appends its own ?w=1200&q=80&... at display time.
      const storedUrl = imageUrl.split("?")[0];
      const displayUrl = storedUrl;

      if (DRY_RUN) {
        console.log(`   [dry-run] ${resort.name}`);
        console.log(`            → ${displayUrl}`);
      } else {
        const { error: updateError } = await supabase
          .from("resort")
          .update({ hero_image: storedUrl })
          .eq("id", resort.id);

        if (updateError) {
          console.error(
            `   ❌ Failed to update "${resort.name}":`,
            updateError.message,
          );
          failed++;
        } else {
          console.log(`   ✅ ${resort.name}`);
          updated++;
        }
      }
    } catch (err) {
      console.error(`   ❌ Error processing "${resort.name}":`, err.message);
      failed++;
    }

    // Respect Unsplash rate limit: 50 req/hour on demo = 1 per 72s
    // In practice the free tier allows ~50 req/hour which is fine for
    // a one-shot batch of ~40 European resorts. We add a 1.5s delay to
    // stay safely within limits.
    if (toProcess.indexOf(resort) < toProcess.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log(`\n   Updated: ${updated} | Failed: ${failed}`);
  if (!DRY_RUN && updated > 0) {
    console.log(`\n✅  Done. Images are live in Supabase.`);
    console.log(
      `   Flush the app's 5-minute resort cache to see changes immediately.`,
    );
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});

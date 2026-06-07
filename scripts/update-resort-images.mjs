/**
 * Populate hero_image in the Supabase resort table using the Unsplash Search API.
 *
 * For each resort the script runs a multi-query fallback chain and scores every
 * candidate image before picking the best match:
 *
 *   Score = (ski_tag_hits × 3) + (description_keyword_hits × 2) − (off_topic_tag_hits × 5)
 *
 * Query chain (stops at first query that yields a candidate with score ≥ 3):
 *   1. "{name} ski resort {country}"   — most specific
 *   2. "{name} skiing {region}"         — region fallback
 *   3. "{name} ski {country}"           — shorter, fewer zero-result misses
 *   4. "skiing {region} {country}"      — drops resort name for ambiguous cases
 *   5. Local SKI_PHOTO_POOL             — zero-API-call guaranteed ski photo
 *
 * Unsplash images are served via their CDN and do not require an API key at
 * display time — only this one-shot script needs the key.
 *
 * Usage:
 *   node scripts/update-resort-images.mjs
 *
 * Keys are loaded automatically from .env.local in the project root.
 * You can also pass them explicitly if needed:
 *   UNSPLASH_ACCESS_KEY=your-key SUPABASE_SERVICE_KEY=your-key node scripts/update-resort-images.mjs
 *
 * Optional flags:
 *   --force     Re-fetch images even for resorts that already have one
 *   --dry-run   Print what would be updated without writing to Supabase
 *   --report    Print the chosen URL, query used, and score for every resort
 *               (implies --dry-run; useful for QA before a live run)
 *
 * Get keys from:
 *   Unsplash: https://unsplash.com/oauth/applications
 *   Supabase: https://supabase.com/dashboard/project/xhfjeoynmcwaslzjxhdt/settings/api
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ─── Load .env.local ──────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

try {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch {
  // .env.local not present — fall through to process.env / CLI-supplied values
}

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://xhfjeoynmcwaslzjxhdt.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run") || process.argv.includes("--report");
const REPORT = process.argv.includes("--report");

// Use Unsplash's "raw" URL — no size params baked in, so the app can
// append its own sizing query string without creating a malformed URL.
const IMAGE_SIZE = "raw";

// ─── Scoring ──────────────────────────────────────────────────────────────────

const SKI_TAGS = new Set([
  "ski", "skiing", "snowboarding", "snowboard", "alpine", "mountain",
  "snow", "winter", "slopes", "slope", "piste", "gondola", "chairlift",
  "ski lift", "ski resort", "resort", "powder", "snowfall", "frost",
  "ice", "cold", "freezing", "peak", "summit", "glacier",
]);

const OFF_TOPIC_TAGS = new Set([
  "beach", "ocean", "sea", "surf", "surfing", "passport", "visa",
  "tropical", "palm", "sand", "swimming", "snorkeling", "diving",
  "desert", "savanna", "jungle", "rainforest",
]);

const SKI_KEYWORDS = /ski|alpine|mountain|snow|slope|piste|gondola|chairlift|powder|resort/i;

/**
 * Score a single Unsplash result for ski-resort relevance.
 * Higher is better. Negative scores indicate clearly off-topic images.
 */
function scoreResult(result) {
  let score = 0;

  // Tags (AI-curated, most reliable signal)
  const tags = (result.tags ?? []).map((t) =>
    (t.title ?? t.type ?? "").toLowerCase()
  );
  for (const tag of tags) {
    if (SKI_TAGS.has(tag)) score += 3;
    if (OFF_TOPIC_TAGS.has(tag)) score -= 5;
  }

  // Description / alt_description (optional but useful when present)
  const text = [result.description, result.alt_description]
    .filter(Boolean)
    .join(" ");
  if (SKI_KEYWORDS.test(text)) score += 2;

  return score;
}

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

const MIN_SCORE = 3; // minimum score to accept a candidate

/**
 * Run a single Unsplash search and return the best-scoring landscape result
 * that meets MIN_SCORE, or null if no qualifying candidate found.
 */
async function searchUnsplash(queryString) {
  const query = encodeURIComponent(queryString);
  const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=15&orientation=landscape&content_filter=high`;

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

  // Score every candidate and pick the best qualifying one
  let bestResult = null;
  let bestScore = MIN_SCORE - 1;

  for (const result of results) {
    const score = scoreResult(result);
    if (score > bestScore) {
      bestScore = score;
      bestResult = result;
    }
  }

  if (!bestResult) return null;
  return { url: bestResult.urls[IMAGE_SIZE], score: bestScore, query: queryString };
}

/**
 * Search Unsplash for a ski image using a multi-query fallback chain.
 * Returns { url, score, query } for the best match, or null if all fail.
 *
 * Chain order (stops at first query scoring ≥ MIN_SCORE):
 *   1. "{name} ski resort {country}"
 *   2. "{name} skiing {region}"
 *   3. "{name} ski {country}"
 *   4. "skiing {region} {country}"
 *
 * If all API queries fail to meet MIN_SCORE, the caller falls back to the
 * local SKI_PHOTO_POOL (no API call needed).
 */
async function fetchUnsplashImage(resortName, country, region) {
  const queries = [
    `${resortName} ski resort ${country}`,
    `${resortName} skiing ${region}`,
    `${resortName} ski ${country}`,
    `skiing ${region} ${country}`,
  ];

  for (const q of queries) {
    const result = await searchUnsplash(q);
    if (result) return result;

    // Small delay between fallback queries to be polite to the API
    await new Promise((r) => setTimeout(r, 500));
  }

  return null;
}

// ─── Local fallback pool ──────────────────────────────────────────────────────

// Deterministic hash so the same resort name always maps to the same photo.
function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

const SKI_PHOTO_POOL = [
  "1518544866330-4e716499f800",
  "1551698618-1dfe5d97d256",
  "1462275646964-a0e3386b89fa",
  "1451772741724-d20990422508",
  "1520443240718-fce21901db79",
  "1486911278844-a81c5267e227",
  "1542202229-7d93c33f5d07",
  "1416339684178-3a239570f315",
  "1419242902214-272b3f66ee7a",
  "1517483000871-1dbf64a6e1c6",
  "1554188248-986adbb73be4",
  "1605540436563-5bca919ae766",
];

function localFallbackUrl(resortName) {
  const idx = hashName(resortName) % SKI_PHOTO_POOL.length;
  return `https://images.unsplash.com/photo-${SKI_PHOTO_POOL[idx]}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🏔  PisteWise resort image updater`);
  console.log(`   Mode: ${DRY_RUN ? (REPORT ? "REPORT" : "DRY RUN") : "LIVE"} | Force: ${FORCE}\n`);

  // 1. Fetch all resorts from Supabase (including country + region for richer queries)
  const { data: resorts, error } = await supabase
    .from("resort")
    .select("id, name, country, region, hero_image")
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
  let usedFallback = 0;

  for (const resort of toProcess) {
    try {
      const match = await fetchUnsplashImage(
        resort.name,
        resort.country ?? "",
        resort.region ?? resort.country ?? "",
      );

      let storedUrl;
      let source;

      if (match) {
        storedUrl = match.url.split("?")[0];
        source = `score=${match.score} query="${match.query}"`;
      } else {
        // All API queries failed minimum score — use deterministic local fallback
        storedUrl = localFallbackUrl(resort.name);
        source = "local-fallback";
        usedFallback++;
      }

      if (DRY_RUN) {
        if (REPORT) {
          console.log(`   ${resort.name}`);
          console.log(`     source: ${source}`);
          console.log(`     url:    ${storedUrl}`);
        } else {
          console.log(`   [dry-run] ${resort.name} → ${storedUrl}`);
        }
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
          console.log(`   ✅ ${resort.name} (${source})`);
          updated++;
        }
      }
    } catch (err) {
      console.error(`   ❌ Error processing "${resort.name}":`, err.message);
      failed++;
    }

    // Rate limit: 50 requests/hour on the Unsplash demo tier.
    // Each resort uses up to 4 API calls (one per query in the chain).
    // 75 s between resorts keeps total usage ~3 req/min — well within the limit.
    // Upgrade to a production Unsplash app (5 000 req/hour) to eliminate this delay.
    if (toProcess.indexOf(resort) < toProcess.length - 1) {
      await new Promise((r) => setTimeout(r, 75000));
    }
  }

  console.log(`\n   Updated: ${updated} | Fallback: ${usedFallback} | Failed: ${failed}`);
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

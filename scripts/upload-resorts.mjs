/**
 * Upload local resorts data to Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=your-service-role-key node scripts/upload-resorts.mjs
 *
 * Get the service role key from:
 *   https://supabase.com/dashboard/project/xhfjeoynmcwaslzjxhdt/settings/api
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Supabase config
const supabaseUrl = "https://xhfjeoynmcwaslzjxhdt.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_SERVICE_KEY environment variable");
  console.error(
    "   Get it from: https://supabase.com/dashboard/project/xhfjeoynmcwaslzjxhdt/settings/api",
  );
  console.error(
    "   Then run: SUPABASE_SERVICE_KEY=your-key node scripts/upload-resorts.mjs",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the resorts data file
// We need to parse the TypeScript file, so let's just import the JSON-like structure
const resortsPath = join(__dirname, "../src/data/resorts.ts");
const resortsFile = readFileSync(resortsPath, "utf-8");

// Extract the resorts array from the TypeScript file
// This is a simple extraction - the data starts after "export const resorts: Resort[] = ["
const arrayStart = resortsFile.indexOf("export const resorts: Resort[] = [");
if (arrayStart === -1) {
  console.error("❌ Could not find resorts array in resorts.ts");
  process.exit(1);
}

// Find the matching closing bracket
let depth = 0;
let arrayEnd = -1;
for (let i = arrayStart; i < resortsFile.length; i++) {
  if (resortsFile[i] === "[") depth++;
  if (resortsFile[i] === "]") depth--;
  if (depth === 0 && resortsFile[i] === "]") {
    arrayEnd = i + 1;
    break;
  }
}

const arrayStr = resortsFile.slice(
  resortsFile.indexOf("[", arrayStart),
  arrayEnd,
);

// Convert TypeScript object literals to JSON
// Replace property names without quotes with quoted versions
let jsonStr = arrayStr
  // Handle property names (words followed by colon)
  .replace(/(\s+)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
  // Handle trailing commas before closing brackets
  .replace(/,(\s*[}\]])/g, "$1");

let resorts;
try {
  resorts = JSON.parse(jsonStr);
} catch (err) {
  console.error("❌ Failed to parse resorts data:", err.message);
  // Try a different approach - evaluate as JS
  console.log("   Trying alternative parsing...");

  // Use Function constructor to evaluate the array (safer than eval)
  try {
    const fn = new Function(`return ${arrayStr}`);
    resorts = fn();
  } catch (err2) {
    console.error("❌ Alternative parsing also failed:", err2.message);
    process.exit(1);
  }
}

console.log(`📦 Found ${resorts.length} resorts to upload\n`);

// Transform to Supabase format
function resortToSupabase(resort) {
  return {
    id: resort.id,
    name: resort.name,
    country: resort.country,
    region: resort.region,
    sub_region: resort.subRegion ?? null,
    location: resort.location,
    terrain: resort.terrain,
    stats: resort.stats,
    attributes: resort.attributes,
    content: resort.content,
    assets: resort.assets,
    season: resort.season,
  };
}

async function main() {
  console.log("🚀 Uploading resorts to Supabase...\n");

  // Check if table exists by trying to count
  const { count, error: countError } = await supabase
    .from("resorts")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("❌ Error accessing resorts table:", countError.message);
    console.error(
      "   Make sure you've run the migration: supabase/migrations/002_resorts_table.sql",
    );
    process.exit(1);
  }

  console.log(`📊 Current resorts in database: ${count ?? 0}`);

  if (count && count > 0) {
    console.log("⚠️  Table already has data. Clearing existing resorts...");
    const { error: deleteError } = await supabase
      .from("resorts")
      .delete()
      .neq("id", "");
    if (deleteError) {
      console.error("❌ Failed to clear existing data:", deleteError.message);
      process.exit(1);
    }
  }

  // Upload in batches
  const BATCH_SIZE = 50;
  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < resorts.length; i += BATCH_SIZE) {
    const batch = resorts.slice(i, i + BATCH_SIZE).map(resortToSupabase);

    const { error } = await supabase.from("resorts").upsert(batch, {
      onConflict: "id",
    });

    if (error) {
      console.error(
        `❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
        error.message,
      );
      failed += batch.length;
    } else {
      uploaded += batch.length;
      process.stdout.write(`   Uploaded ${uploaded}/${resorts.length}\r`);
    }
  }

  console.log(`\n\n✅ Upload complete!`);
  console.log(`   Uploaded: ${uploaded}`);
  if (failed > 0) {
    console.log(`   Failed: ${failed}`);
  }

  // Verify
  const { count: finalCount } = await supabase
    .from("resorts")
    .select("*", { count: "exact", head: true });

  console.log(`   Total in database: ${finalCount}`);
}

main().catch(console.error);

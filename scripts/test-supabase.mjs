/**
 * Quick test script to check what's in the Supabase database.
 * Run with: node scripts/test-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xhfjeoynmcwaslzjxhdt.supabase.co";
const supabaseAnonKey = "sb_publishable_n6wiEkl-pNYI45aDfP776w_tITdNspI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("🔍 Testing Supabase connection...\n");

  // Check for tables
  const tablesToCheck = [
    "resorts",
    "profiles",
    "user_preferences",
    "user_favorites",
  ];

  for (const table of tablesToCheck) {
    const { data, error, count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count ?? 0} rows`);
    }
  }

  // Fetch sample resorts if any exist
  const { data: resorts, error: resortsError } = await supabase
    .from("resorts")
    .select("id, name, country, region")
    .limit(5);

  if (resortsError) {
    console.log("\n❌ Could not fetch resorts:", resortsError.message);
  } else if (resorts && resorts.length > 0) {
    console.log("\n📍 Sample resorts:");
    resorts.forEach((r) => {
      console.log(`   - ${r.name} (${r.country}, ${r.region})`);
    });
  } else {
    console.log("\n📭 No resorts in database yet.");
    console.log("   Run the migration and upload script:");
    console.log("   1. Run SQL: supabase/migrations/002_resorts_table.sql");
    console.log(
      "   2. SUPABASE_SERVICE_KEY=your-key node scripts/upload-resorts.mjs",
    );
  }
}

main().catch(console.error);

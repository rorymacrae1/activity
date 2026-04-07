/**
 * Comprehensive Supabase connectivity test.
 * Run with: node scripts/test-supabase-full.mjs
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xhfjeoynmcwaslzjxhdt.supabase.co";
const supabaseAnonKey = "sb_publishable_n6wiEkl-pNYI45aDfP776w_tITdNspI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("🔍 Comprehensive Supabase Test\n");
  console.log("URL:", supabaseUrl);
  console.log("Key:", supabaseAnonKey.slice(0, 20) + "...\n");

  // 1. Test basic connectivity
  console.log("1️⃣  Testing auth endpoint...");
  const { data: session, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.log("   ❌ Auth error:", authError.message);
  } else {
    console.log("   ✅ Auth works (no session, expected for anon)");
  }

  // 2. Try to list all accessible tables via pg_catalog
  console.log("\n2️⃣  Querying table existence...");
  const tables = [
    "resorts",
    "profiles",
    "user_preferences",
    "user_favorites",
    "ski_resorts",
  ];

  for (const table of tables) {
    try {
      // Try a simple select with limit 0 - should work even if empty
      const { error, count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.log(`   ❌ ${table}: ${error.code} - ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: accessible (${count ?? 0} rows)`);
      }
    } catch (e) {
      console.log(`   ❌ ${table}: ${e.message}`);
    }
  }

  // 3. Try health check
  console.log("\n3️⃣  Testing REST API health...");
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      const data = await response.json();
      console.log(
        "   Available endpoints:",
        Object.keys(data.paths || data)
          .slice(0, 10)
          .join(", "),
      );
    }
  } catch (e) {
    console.log("   ❌ REST health check failed:", e.message);
  }

  // 4. Try to fetch from profiles (should work with RLS)
  console.log("\n4️⃣  Testing profiles table directly...");
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .limit(5);

  if (profilesError) {
    console.log("   ❌ Profiles error:", profilesError.message);
  } else {
    console.log(
      `   ✅ Profiles query works (${profiles?.length ?? 0} results)`,
    );
  }

  // 5. Check if we can create a test record (will fail without auth)
  console.log("\n5️⃣  Testing write access (expected to fail without auth)...");
  const { error: insertError } = await supabase
    .from("profiles")
    .insert({ id: "test-id", display_name: "Test" });

  if (insertError) {
    console.log(`   ✅ Insert blocked as expected: ${insertError.code}`);
  } else {
    console.log("   ⚠️  Insert succeeded (unexpected - cleanup needed)");
    await supabase.from("profiles").delete().eq("id", "test-id");
  }

  console.log("\n✅ Test complete!");
}

main().catch(console.error);

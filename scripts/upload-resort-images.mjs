#!/usr/bin/env node
/**
 * Upload resort hero images to Supabase Storage.
 *
 * Takes the locally downloaded images from assets/images/resorts/ and
 * uploads them to a Supabase Storage bucket ("resort-images"), then
 * updates each resort's hero_image column to point at the public Storage URL.
 *
 * After running this script, the app loads images from your own CDN
 * (Supabase Storage + built-in CDN) instead of Unsplash, so URLs
 * never break when photographers delete their photos.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=your-key node scripts/upload-resort-images.mjs
 *
 * Options:
 *   --force    Re-upload even if the file already exists in Storage
 *   --dry-run  Show what would happen without writing anything
 *
 * Prerequisites:
 *   1. Run scripts/download-resort-images.mjs first to download images
 *   2. Create a public "resort-images" bucket in Supabase Storage
 *      (Dashboard → Storage → New bucket → toggle Public)
 */

import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const IMAGE_DIR = join(ROOT, "assets", "images", "resorts");

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://xhfjeoynmcwaslzjxhdt.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "";
const BUCKET = "resort-images";
const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_KEY) {
  console.error(
    "❌  Missing SUPABASE_SERVICE_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/** Convert resort name to the same slug used by the download script. */
function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🏔  PisteWise resort image uploader → Supabase Storage`);
  console.log(`   Bucket: ${BUCKET}`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"} | Force: ${FORCE}\n`);

  // 1. Ensure the bucket exists
  if (!DRY_RUN) {
    const { error: bucketErr } = await supabase.storage.getBucket(BUCKET);
    if (bucketErr) {
      console.log(`   Creating public bucket "${BUCKET}"...`);
      const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5 MB per image max
      });
      if (createErr) {
        console.error("❌  Failed to create bucket:", createErr.message);
        process.exit(1);
      }
      console.log(`   ✅ Bucket created\n`);
    }
  }

  // 2. Fetch all resorts from Supabase
  const { data: resorts, error } = await supabase
    .from("resort")
    .select("id, name, hero_image")
    .order("name");

  if (error) {
    console.error("❌  Supabase error:", error.message);
    process.exit(1);
  }

  console.log(`   Found ${resorts.length} resorts\n`);

  // 3. Read local image directory
  let localFiles;
  try {
    localFiles = new Set(await readdir(IMAGE_DIR));
  } catch {
    console.error(
      "❌  No local images found. Run download-resort-images.mjs first.",
    );
    process.exit(1);
  }

  const uploaded = [];
  const skipped = [];
  const failed = [];

  for (const resort of resorts) {
    const slug = slugify(resort.name);
    const fileName = `${slug}.jpg`;
    const storagePath = `heroes/${fileName}`;

    // Check if local image exists
    if (!localFiles.has(fileName)) {
      console.log(`   ⚠  ${resort.name} → no local image (${fileName})`);
      skipped.push({ name: resort.name, reason: "no local file" });
      continue;
    }

    // Check if already uploaded (skip unless --force)
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
    if (
      !FORCE &&
      resort.hero_image &&
      resort.hero_image.includes(`/storage/`)
    ) {
      console.log(`   ⏭  ${resort.name} (already on Storage)`);
      skipped.push({ name: resort.name, reason: "already uploaded" });
      continue;
    }

    if (DRY_RUN) {
      console.log(`   📋 ${resort.name} → ${storagePath}`);
      uploaded.push({ name: resort.name, slug });
      continue;
    }

    try {
      // Upload
      const fileBuffer = await readFile(join(IMAGE_DIR, fileName));
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      // Update DB
      const { error: updateErr } = await supabase
        .from("resort")
        .update({ hero_image: publicUrl })
        .eq("id", resort.id);

      if (updateErr) {
        throw new Error(`DB update failed: ${updateErr.message}`);
      }

      console.log(`   ✅ ${resort.name} → ${storagePath}`);
      uploaded.push({ name: resort.name, slug });
    } catch (err) {
      console.error(`   ❌ ${resort.name}: ${err.message}`);
      failed.push({ name: resort.name, error: err.message });
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log(`\n   Summary:`);
  console.log(`     Uploaded:  ${uploaded.length}`);
  console.log(`     Skipped:   ${skipped.length}`);
  if (failed.length > 0) {
    console.log(`     Failed:    ${failed.length}`);
    failed.forEach((f) => console.log(`       - ${f.name}: ${f.error}`));
  }
  console.log();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

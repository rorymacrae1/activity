#!/usr/bin/env node
/**
 * Download resort hero images from Unsplash and save them locally.
 *
 * For each resort in Supabase, downloads the hero_image URL (or the
 * deterministic fallback from SKI_PHOTO_POOL) to assets/images/resorts/.
 * Then generates src/data/resortImageAssets.ts — a static require() map
 * so Metro can bundle them for offline use.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=your-key node scripts/download-resort-images.mjs
 *
 * Options:
 *   --force    Re-download even if the file already exists
 *   --dry-run  Show what would be downloaded without writing anything
 */

import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const IMAGE_DIR = join(ROOT, "assets", "images", "resorts");
const REGISTRY_PATH = join(ROOT, "src", "data", "resortImageAssets.ts");

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://xhfjeoynmcwaslzjxhdt.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "";
const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");

// Fallback pool (mirrors src/data/resortImages.ts)
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

function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getFallbackUrl(name) {
  const idx = hashName(name) % SKI_PHOTO_POOL.length;
  return `https://images.unsplash.com/photo-${SKI_PHOTO_POOL[idx]}?w=1200&q=80&auto=format&fit=crop`;
}

/** Convert resort name to a filesystem-safe slug */
function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// ─── Download ────────────────────────────────────────────────────────────────

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buffer);
  return buffer.length;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🏔  PisteWise resort image downloader`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"} | Force: ${FORCE}\n`);

  if (!SUPABASE_KEY) {
    console.error(
      "❌  Missing SUPABASE_SERVICE_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY",
    );
    console.error("   Set one of these env vars or create a .env.local file.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: resorts, error } = await supabase
    .from("resort")
    .select("id, name, hero_image")
    .order("name");

  if (error) {
    console.error("❌  Supabase error:", error.message);
    process.exit(1);
  }

  console.log(`   Found ${resorts.length} resorts\n`);

  if (!DRY_RUN) {
    await mkdir(IMAGE_DIR, { recursive: true });
  }

  const downloaded = [];
  const skipped = [];
  const failed = [];

  for (const resort of resorts) {
    const slug = slugify(resort.name);
    const fileName = `${slug}.jpg`;
    const destPath = join(IMAGE_DIR, fileName);

    // Build the source URL
    const sourceUrl = resort.hero_image
      ? `${resort.hero_image.split("?")[0]}?w=1200&q=80&auto=format&fit=crop`
      : getFallbackUrl(resort.name);

    // Skip if already downloaded (unless --force)
    if (!FORCE && (await fileExists(destPath))) {
      console.log(`   ⏭  ${resort.name} → ${fileName} (exists)`);
      skipped.push({ name: resort.name, slug, fileName });
      continue;
    }

    if (DRY_RUN) {
      console.log(`   📋 ${resort.name} → ${fileName}`);
      console.log(`      ${sourceUrl}`);
      downloaded.push({ name: resort.name, slug, fileName });
      continue;
    }

    try {
      const bytes = await downloadImage(sourceUrl, destPath);
      const kb = (bytes / 1024).toFixed(0);
      console.log(`   ✅ ${resort.name} → ${fileName} (${kb} KB)`);
      downloaded.push({ name: resort.name, slug, fileName });

      // Respectful delay between requests
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`   ❌ ${resort.name}: ${err.message}`);
      failed.push({ name: resort.name, slug, fileName });
    }
  }

  // ── Generate the TypeScript registry ──────────────────────────────────────

  const allResorts = [...downloaded, ...skipped].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  const requireLines = allResorts
    .map(
      (r) =>
        `  "${r.slug}": require("../../../assets/images/resorts/${r.fileName}"),`,
    )
    .join("\n");

  const registryContent = `/**
 * Auto-generated by scripts/download-resort-images.mjs
 * DO NOT EDIT MANUALLY
 *
 * Maps resort slug → bundled local image asset.
 * Re-run the script to update after adding/changing resorts.
 */

/**
 * Static require map of resort hero images bundled into the app binary.
 * Keys are slugified resort names (e.g. "chamonix-mont-blanc").
 *
 * Metro resolves require() at build time, so every image listed here
 * is included in the bundle and available offline.
 */
export const RESORT_IMAGE_ASSETS: Record<string, number> = {
${requireLines}
};

/** Convert a resort name to the slug key used in RESORT_IMAGE_ASSETS. */
export function resortSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
`;

  if (!DRY_RUN) {
    await writeFile(REGISTRY_PATH, registryContent, "utf-8");
    console.log(`\n   📄 Generated ${REGISTRY_PATH}`);
  } else {
    console.log(`\n   📄 Would generate ${REGISTRY_PATH}`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log(`\n   Summary:`);
  console.log(`     Downloaded: ${downloaded.length}`);
  console.log(`     Skipped:    ${skipped.length}`);
  if (failed.length > 0) {
    console.log(`     Failed:     ${failed.length}`);
    failed.forEach((f) => console.log(`       - ${f.name}`));
  }
  console.log();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

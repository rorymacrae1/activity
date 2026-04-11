#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://peakwise.app";
const TODAY = new Date().toISOString().split("T")[0];

// Extract resort IDs from CSV (fallback to empty array if file doesn't exist)
let resortIds = [];
try {
  const csvPath = path.join(__dirname, "../public/ski-resorts.csv");
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, "utf8");
    const lines = csvContent.split("\n").slice(1); // Skip header
    resortIds = lines
      .filter((line) => line.trim())
      .map((line) => {
        // Extract name (2nd column) and convert to URL-friendly slug
        const match = line.match(/^\d+,([^,]+)/);
        if (match) {
          return match[1]
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        }
        return null;
      })
      .filter(Boolean);
  }
} catch (err) {
  console.warn("Could not load resort IDs from CSV, skipping resort URLs");
  console.warn(err.message);
}

const staticPages = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/discover", priority: "0.8", changefreq: "weekly" },
  { url: "/favorites", priority: "0.7", changefreq: "monthly" },
  { url: "/profile", priority: "0.5", changefreq: "monthly" },
];

const urls = [
  ...staticPages.map(
    (p) => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ),
  ...resortIds.map(
    (id) => `  <url>
    <loc>${BASE_URL}/resort/${id}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`
  ),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

const outDir = path.join(__dirname, "../public");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
console.log(`✓ Sitemap generated with ${resortIds.length} resorts → public/sitemap.xml`);

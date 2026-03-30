#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://peakwise.app";
const TODAY = new Date().toISOString().split("T")[0];

// Extract resort IDs from TypeScript source using regex
const resortsSource = fs.readFileSync(
  path.join(__dirname, "../src/data/resorts.ts"),
  "utf8"
);
const idMatches = resortsSource.matchAll(/^\s+id:\s+"([^"]+)"/gm);
const resortIds = Array.from(idMatches, (m) => m[1]);

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

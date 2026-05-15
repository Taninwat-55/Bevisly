
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

// Polyfill for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (from .env or process)
// Note: In a real CI/CD pipeline, these would be set in the environment.
// For local development, you might need to source .env first.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASE_URL = "https://bevisly.com";

async function generateSitemap() {
  console.log("🔍 Fetching data for sitemap...");

  // 1. Fetch Public Jobs
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, updated_at")
    .eq("status", "open") // Assuming status handles public visibility
    .order("updated_at", { ascending: false });

  if (jobsError) console.error("Error fetching jobs:", jobsError);

  // 2. Fetch Public Profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .eq("is_public", true)
    .not("username", "is", null);

  if (profilesError) console.error("Error fetching profiles:", profilesError);

  // 3. Static Routes
  const staticRoutes = [
    { url: "/", changefreq: "daily", priority: 1.0 },
    { url: "/auth", changefreq: "monthly", priority: 0.8 },
    { url: "/leaderboard", changefreq: "daily", priority: 0.9 },
    { url: "/blog", changefreq: "weekly", priority: 0.8 },
  ];

  // 4. Blog Posts from markdown files
  const blogDir = path.resolve(__dirname, "../src/content/blog");
  const blogFiles = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"))
    : [];

  /* ─── XML Generation ────────────────────────────────────────────── */
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add Static Routes
  staticRoutes.forEach((route) => {
    sitemap += `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  });

  // Add Job Routes
  jobs?.forEach((job) => {
    sitemap += `  <url>
    <loc>${BASE_URL}/jobs/${job.id}</loc>
    <lastmod>${new Date(job.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Add Blog Post Routes
  blogFiles.forEach((file) => {
    const raw = fs.readFileSync(path.join(blogDir, file), "utf-8");
    const { data } = matter(raw);
    const slug = data.slug ?? file.replace(".md", "");
    const lastmod = new Date(data.updatedDate ?? data.date ?? Date.now()).toISOString();
    sitemap += `  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  // Add Profile Routes
  profiles?.forEach((profile) => {
    if (profile.username) {
      sitemap += `  <url>
    <loc>${BASE_URL}/@${profile.username}</loc>
    <lastmod>${new Date(profile.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }
  });

  sitemap += `</urlset>`;

  /* ─── Write File ────────────────────────────────────────────────── */
  const publicDir = path.resolve(__dirname, "../public");
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);

  console.log(`✅ Sitemap generated successfully with:`);
  console.log(`   - ${staticRoutes.length} static routes`);
  console.log(`   - ${blogFiles.length} blog posts`);
  console.log(`   - ${jobs?.length || 0} job posts`);
  console.log(`   - ${profiles?.length || 0} public profiles`);
  console.log(`   Saved to: ${path.join(publicDir, "sitemap.xml")}`);
}

generateSitemap();

/**
 * Sitemap Generator for Uyirgene
 *
 * Generates sitemap.xml with static routes + dynamic routes from the API.
 * Run: node scripts/generate-sitemap.js
 * Optionally set API_BASE_URL env var (defaults to http://localhost:8080)
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://learn.uyirgene.com';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080';

// Static routes with priority and change frequency
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/courses', priority: '0.9', changefreq: 'daily' },
  { path: '/flagship', priority: '0.9', changefreq: 'weekly' },
  { path: '/standards', priority: '0.7', changefreq: 'monthly' },
  { path: '/services', priority: '0.8', changefreq: 'weekly' },
  { path: '/services/microbiology-research', priority: '0.7', changefreq: 'monthly' },
  { path: '/services/certification', priority: '0.7', changefreq: 'monthly' },
  { path: '/services/testing', priority: '0.7', changefreq: 'monthly' },
  { path: '/services/clinical-research', priority: '0.7', changefreq: 'monthly' },
  { path: '/services/gmo-testing', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/careers', priority: '0.5', changefreq: 'weekly' },
  { path: '/faq', priority: '0.5', changefreq: 'monthly' },
  { path: '/community', priority: '0.4', changefreq: 'monthly' },
  { path: '/verify-certificate', priority: '0.5', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/cookies', priority: '0.3', changefreq: 'yearly' },
  { path: '/refund', priority: '0.3', changefreq: 'yearly' },
  { path: '/accessibility', priority: '0.3', changefreq: 'yearly' },
  { path: '/help', priority: '0.4', changefreq: 'monthly' },
];

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ path: urlPath, priority, changefreq, lastmod }) {
  let entry = `  <url>\n    <loc>${escapeXml(BASE_URL + urlPath)}</loc>\n`;
  if (lastmod) entry += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) entry += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) entry += `    <priority>${priority}</priority>\n`;
  entry += '  </url>';
  return entry;
}

async function generateSitemap() {
  const urls = [];

  // Add static routes
  const today = new Date().toISOString().split('T')[0];
  for (const route of STATIC_ROUTES) {
    urls.push(urlEntry({ ...route, lastmod: today }));
  }

  // Fetch dynamic routes from API
  try {
    console.log(`Fetching courses from ${API_BASE}/api/courses ...`);
    const courses = await fetchJson(`${API_BASE}/api/courses`);
    for (const course of courses) {
      urls.push(
        urlEntry({
          path: `/courses/${course.id}`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: today,
        })
      );
    }
    console.log(`  Added ${courses.length} course URLs`);
  } catch (err) {
    console.warn('  Could not fetch courses:', err.message);
  }

  try {
    console.log(`Fetching blogs from ${API_BASE}/api/blogs ...`);
    const blogs = await fetchJson(`${API_BASE}/api/blogs`);
    for (const blog of blogs) {
      const slug = blog.urlSlug || blog.id;
      const lastmod = blog.updatedAt
        ? new Date(blog.updatedAt).toISOString().split('T')[0]
        : today;
      urls.push(
        urlEntry({
          path: `/blog/${slug}`,
          priority: '0.7',
          changefreq: 'weekly',
          lastmod,
        })
      );
    }
    console.log(`  Added ${blogs.length} blog URLs`);
  } catch (err) {
    console.warn('  Could not fetch blogs:', err.message);
  }

  try {
    console.log(`Fetching flagship programs from ${API_BASE}/api/flagship ...`);
    const programs = await fetchJson(`${API_BASE}/api/flagship`);
    for (const program of programs) {
      urls.push(
        urlEntry({
          path: `/flagship/${program.id}`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: today,
        })
      );
    }
    console.log(`  Added ${programs.length} flagship program URLs`);
  } catch (err) {
    console.warn('  Could not fetch flagship programs:', err.message);
  }

  try {
    console.log(`Fetching bundles from ${API_BASE}/api/bundles ...`);
    const bundles = await fetchJson(`${API_BASE}/api/bundles`);
    for (const bundle of bundles) {
      urls.push(
        urlEntry({
          path: `/bundles/${bundle.id}`,
          priority: '0.7',
          changefreq: 'weekly',
          lastmod: today,
        })
      );
    }
    console.log(`  Added ${bundles.length} bundle URLs`);
  } catch (err) {
    console.warn('  Could not fetch bundles:', err.message);
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n');

  const outPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, sitemap, 'utf-8');
  console.log(`\nSitemap generated: ${outPath} (${urls.length} URLs)`);
}

generateSitemap().catch((err) => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});

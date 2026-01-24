const fs = require("fs");
const path = require("path");

// Base URL of your website
const BASE_URL = "https://latestjobs.space";

// Paths to JSON data
const BLOGS_FILE = path.join(__dirname, "blogs.json");
const JOBS_FILE = path.join(__dirname, "jobs.json");
const PAPERS_FILE = path.join(__dirname, "papers.json");
const SITEMAP_FILE = path.join(__dirname, "sitemap.xml");

// Read JSON Helper
const readJson = (file) => {
  try {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file, "utf8");
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
    return [];
  }
};

// Generate Sitemap XML
const generateSitemap = () => {
  const blogs = readJson(BLOGS_FILE);
  const jobs = readJson(JOBS_FILE);
  const papers = readJson(PAPERS_FILE);

  const currentDate = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Static Pages -->
    <url>
        <loc>${BASE_URL}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${BASE_URL}/jobs.html</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${BASE_URL}/blogs.html</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${BASE_URL}/papers.html</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
`;

  // Dynamic Blog Pages
  blogs.forEach((blog) => {
    if (blog.slug) {
      xml += `    <url>
        <loc>${BASE_URL}/blog.html?slug=${blog.slug}</loc>
        <lastmod>${blog.updatedAt || blog.createdAt || currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
`;
    }
  });

  // Dynamic Job Pages
  jobs.forEach((job) => {
    if (job.id) {
      xml += `    <url>
        <loc>${BASE_URL}/job.html?id=${job.id}</loc>
        <lastmod>${job.createdAt || currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
`;
    }
  });

  // Dynamic Job Category Pages (by Source)
  const sources = [...new Set(jobs.map((j) => j.source))];
  sources.forEach((source) => {
    if (source) {
      xml += `    <url>
        <loc>${BASE_URL}/?source=${encodeURIComponent(source)}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
`;
    }
  });

  // Dynamic Paper Pages
  // 1. By Exam (e.g. ?exam=ssc-cgl)
  const exams = [...new Set(papers.map((p) => p.exam))];
  exams.forEach((exam) => {
    if (exam) {
      xml += `    <url>
        <loc>${BASE_URL}/paper.html?exam=${exam}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
`;
    }
  });

  // 2. By Exam & Year (e.g. ?exam=ssc-cgl&year=2024)
  const examYears = [
    ...new Set(papers.map((p) => `${p.exam}|${p.year}`)),
  ].filter((s) => s.indexOf("|") > 0);

  examYears.forEach((pair) => {
    const [exam, year] = pair.split("|");
    if (exam && year) {
      xml += `    <url>
        <loc>${BASE_URL}/paper.html?exam=${exam}&amp;year=${year}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
`;
    }
  });

  xml += `</urlset>`;

  fs.writeFileSync(SITEMAP_FILE, xml);
  console.log(`✅ Sitemap generated successfully at ${SITEMAP_FILE}`);
  console.log(`   - Static Pages: 4`);
  console.log(`   - Blog Pages: ${blogs.length}`);
  console.log(`   - Job Pages: ${jobs.length}`);
  console.log(`   - Category Pages: ${sources.length}`);
  console.log(`   - Paper Pages: ${exams.length + examYears.length}`);
};

// Run
generateSitemap();

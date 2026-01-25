/**
 * Blog Page - Renders blog content from blogs.json or localStorage
 */

import { useTheme } from "./hooks/theme.js";
import { useI18n } from "./hooks/i18n.js";
import { useJobs } from "./hooks/jobs.js";
import { SEO } from "./hooks/pseo.js";

const theme = useTheme();
const i18n = useI18n();
const jobs = useJobs();

const STORAGE_KEY = "job-alert-blogs";

// DOM Elements
const elements = {
  themeToggle: document.getElementById("themeToggle"),
  langToggle: document.getElementById("langToggle"),
  featuredSection: document.getElementById("featuredSection"),
  breadcrumbTitle: document.getElementById("breadcrumbTitle"),
  blogSkeleton: document.getElementById("blogSkeleton"),
  blogContent: document.getElementById("blogContent"),
  blogError: document.getElementById("blogError"),
  blogCategory: document.getElementById("blogCategory"),
  blogTitle: document.getElementById("blogTitle"),
  blogDate: document.getElementById("blogDate"),
  blogUpdated: document.getElementById("blogUpdated"),
  blogBody: document.getElementById("blogBody"),
  relatedJobsSection: document.getElementById("relatedJobsSection"),
  relatedJobsGrid: document.getElementById("relatedJobsGrid"),
  relatedBlogsSection: document.getElementById("relatedBlogsSection"),
  relatedBlogsGrid: document.getElementById("relatedBlogsGrid"),
};

/**
 * Get blog slug from URL
 */
function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

/**
 * Load blogs from localStorage or fetch blogs.json
 */
async function loadBlogs() {
  // First try localStorage (for admin-created blogs)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("No blogs in localStorage");
  }

  // Fallback to blogs.json file
  try {
    const response = await fetch("blogs.json");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("No blogs.json file found");
  }

  return [];
}

/**
 * Markdown to HTML converter
 */
function markdownToHtml(markdown) {
  if (!markdown) return "";

  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^\- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  if (
    !html.startsWith("<h") &&
    !html.startsWith("<ul") &&
    !html.startsWith("<ol")
  ) {
    html = "<p>" + html + "</p>";
  }

  html = html.replace(/<p><\/p>/g, "").replace(/<p><br><\/p>/g, "");

  // Tables
  html = html.replace(
    /\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g,
    (match, header, body) => {
      const headers = header
        .split("|")
        .filter((c) => c.trim())
        .map((c) => `<th>${c.trim()}</th>`)
        .join("");
      const rows = body
        .trim()
        .split("\n")
        .map((row) => {
          const cells = row
            .split("|")
            .filter((c) => c.trim())
            .map((c) => `<td>${c.trim()}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    },
  );

  return html;
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Update meta tags
 */
function updateMetaTags(blog) {
  document.title = blog.metaTitle || `${blog.title} | Job Alert`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", blog.metaDescription || "");
  }

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute(
      "href",
      `${window.location.origin}/blog.html?slug=${blog.slug}`,
    );
  }

  // Update schema
  const schemaScript = document.getElementById("blogSchema");
  if (schemaScript) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.metaDescription || blog.title,
      datePublished: blog.createdAt,
      dateModified: blog.updatedAt || blog.createdAt,
      author: {
        "@type": "Organization",
        name: "Job Alert",
      },
      keywords: [blog.primaryKeyword, ...(blog.secondaryKeywords || [])]
        .filter(Boolean)
        .join(", "),
    };
    schemaScript.textContent = JSON.stringify(schema, null, 2);
  }
}

/**
 * Render blog content
 */
function renderBlog(blog) {
  // Programmatic SEO
  SEO.updateMeta({
    title: blog.metaTitle || `${blog.title} | Job Alert`,
    description: blog.metaDescription,
    url: window.location.href,
    image: "https://latestjobs.space/assets/og-default.png",
  });

  SEO.injectSchema(SEO.generateBlogSchema(blog));

  elements.breadcrumbTitle.textContent =
    blog.title.length > 30 ? blog.title.substring(0, 30) + "..." : blog.title;

  elements.blogCategory.textContent = blog.primaryKeyword || "Article";
  elements.blogTitle.textContent = blog.title;
  elements.blogDate.textContent = formatDate(blog.createdAt);
  elements.blogUpdated.textContent = blog.updatedAt
    ? `Last updated: ${formatDate(blog.updatedAt)}`
    : "";

  elements.blogBody.innerHTML = markdownToHtml(blog.content);

  elements.blogSkeleton.classList.add("hidden");
  elements.blogContent.classList.remove("hidden");
}

/**
 * Render related jobs
 */
async function renderRelatedJobs(relatedJobIds) {
  if (!relatedJobIds || relatedJobIds.length === 0) return;

  try {
    const allJobs = await jobs.fetchJobs();
    const related = allJobs
      .filter((job) => relatedJobIds.includes(job.id))
      .slice(0, 3);

    if (related.length === 0) return;

    const html = related
      .map(
        (job) => `
            <a href="job.html?id=${job.id}" class="job-card job-card-link">
                <div class="job-card-header">
                    <span class="job-source">${escapeHtml(job.source)}</span>
                </div>
                <h3 class="job-title">${escapeHtml(job.title)}</h3>
            </a>
        `,
      )
      .join("");

    elements.relatedJobsGrid.innerHTML = html;
    elements.relatedJobsSection.classList.remove("hidden");
  } catch (e) {
    console.warn("Could not load related jobs");
  }
}

/**
 * Render related blogs
 */
async function renderRelatedBlogs(relatedSlugs, allBlogs, currentSlug) {
  if (!relatedSlugs || relatedSlugs.length === 0) return;

  const related = allBlogs
    .filter((b) => relatedSlugs.includes(b.slug) && b.slug !== currentSlug)
    .slice(0, 3);

  if (related.length === 0) return;

  const html = related
    .map(
      (blog) => `
        <a href="blog.html?slug=${blog.slug}" class="blog-card">
            <h3 class="blog-card-title">${escapeHtml(blog.title)}</h3>
            <span class="blog-card-date">${formatDate(blog.createdAt)}</span>
        </a>
    `,
    )
    .join("");

  elements.relatedBlogsGrid.innerHTML = html;
  elements.relatedBlogsSection.classList.remove("hidden");
}

/**
 * Show error state
 */
function showError() {
  elements.blogSkeleton.classList.add("hidden");
  elements.blogContent.classList.add("hidden");
  elements.blogError.classList.remove("hidden");
  document.title = "Article Not Found | Job Alert";
}

/**
 * Initialize
 */
async function init() {
  theme.init();
  i18n.init();

  if (elements.langToggle) {
    elements.langToggle.querySelector(".lang-text").textContent =
      i18n.getLanguage() === "en" ? "HI" : "EN";
  }

  elements.themeToggle.addEventListener("click", () => {
    theme.toggleTheme();
  });

  if (elements.langToggle) {
    elements.langToggle.addEventListener("click", () => {
      const nextLang = i18n.getLanguage() === "en" ? "hi" : "en";
      i18n.setLanguage(nextLang);
      elements.langToggle.querySelector(".lang-text").textContent =
        nextLang === "en" ? "HI" : "EN";
      // Re-render the blog content if language changes
      // This assumes blog content might be localized
      // For now, just reload the page to apply language changes fully
      window.location.reload();
    });
  }

  const slug = getSlugFromUrl();

  if (!slug) {
    showError();
    return;
  }

  try {
    const blogs = await loadBlogs();
    const blog = blogs.find((b) => b.slug === slug);

    if (!blog) {
      showError();
      return;
    }

    renderBlog(blog);
    await renderRelatedJobs(blog.relatedJobs);
    await renderRelatedBlogs(blog.relatedBlogs, blogs, slug);
  } catch (error) {
    console.error("Failed to load blog:", error);
    showError();
  }
}

init();

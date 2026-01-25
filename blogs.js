/**
 * Blogs Listing Page
 */

import { useTheme } from "./hooks/theme.js";
import { useI18n } from "./hooks/i18n.js";

const theme = useTheme();
const i18n = useI18n();

// DOM Elements
const elements = {
  themeToggle: document.getElementById("themeToggle"),
  langToggle: document.getElementById("langToggle"),
  featuredSection: document.getElementById("featuredSection"),
  featuredBlogs: document.getElementById("featuredBlogs"),
  allBlogs: document.getElementById("allBlogs"),
  noBlogs: document.getElementById("noBlogs"),
};

/**
 * Load blogs from localStorage or JSON
 */
async function loadBlogs() {
  try {
    const response = await fetch("blogs.json?t=" + Date.now());
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("No blogs.json");
  }

  return [];
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
 * Create blog card HTML
 */
function createBlogCard(blog) {
  return `
        <a href="blog.html?slug=${blog.slug}" class="blog-card">
            <span class="blog-card-category">${escapeHtml(blog.primaryKeyword || "Article")}</span>
            <h3 class="blog-card-title">${escapeHtml(blog.title)}</h3>
            <p class="blog-card-excerpt">${escapeHtml(blog.metaDescription || "").substring(0, 100)}...</p>
            <span class="blog-card-date">${formatDate(blog.createdAt)}</span>
        </a>
    `;
}

/**
 * Render blogs
 */
async function renderBlogs() {
  const blogs = await loadBlogs();

  // Sort blogs: Newest first
  blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (blogs.length === 0) {
    elements.featuredSection.classList.add("hidden");
    elements.allBlogs.innerHTML = "";
    elements.noBlogs.classList.remove("hidden");
    return;
  }

  // Featured blogs
  const featured = blogs.filter((b) => b.featured);
  if (featured.length > 0) {
    elements.featuredBlogs.innerHTML = featured.map(createBlogCard).join("");
    elements.featuredSection.classList.remove("hidden");
  } else {
    elements.featuredSection.classList.add("hidden");
  }

  // All blogs
  elements.allBlogs.innerHTML = blogs.map(createBlogCard).join("");
}

/**
 * Initialize
 */
function init() {
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
      renderBlogs();
    });
  }

  renderBlogs();
}

init();

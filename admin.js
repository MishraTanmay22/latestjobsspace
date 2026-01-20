/**
 * Admin Panel - Blog Content Management
 */

import { useTheme } from "./hooks/theme.js";

const theme = useTheme();

// Configuration
const ADMIN_PASSWORD = "sarkari@2026"; // Change this to your password
const STORAGE_KEY = "job-alert-blogs";
const JOBS_STORAGE_KEY = "job-alert-jobs-admin";
const PAPERS_STORAGE_KEY = "job-alert-papers";

// State
let blogs = [];
let jobs = [];
let papers = [];
let currentBlogId = null;
let currentJobId = null;
let currentPaperId = null;
let activeTab = "blogs";

// DOM Elements
const elements = {
  loginScreen: document.getElementById("loginScreen"),
  loginForm: document.getElementById("loginForm"),
  adminPassword: document.getElementById("adminPassword"),
  loginError: document.getElementById("loginError"),
  adminPanel: document.getElementById("adminPanel"),
  sidebarTitle: document.getElementById("sidebarTitle"),
  itemList: document.getElementById("itemList"),
  // Blog editor
  editorPanel: document.getElementById("editorPanel"),
  blogForm: document.getElementById("blogForm"),
  blogId: document.getElementById("blogId"),
  blogTitle: document.getElementById("blogTitle"),
  blogSlug: document.getElementById("blogSlug"),
  metaTitle: document.getElementById("metaTitle"),
  metaDescription: document.getElementById("metaDescription"),
  primaryKeyword: document.getElementById("primaryKeyword"),
  secondaryKeywords: document.getElementById("secondaryKeywords"),
  blogContent: document.getElementById("blogContent"),
  relatedJobs: document.getElementById("relatedJobs"),
  relatedBlogs: document.getElementById("relatedBlogs"),
  wordCount: document.getElementById("wordCount"),
  metaTitleCount: document.getElementById("metaTitleCount"),
  metaDescCount: document.getElementById("metaDescCount"),
  previewPanel: document.getElementById("previewPanel"),
  previewContent: document.getElementById("previewContent"),
  // Papers editor
  papersEditorPanel: document.getElementById("papersEditorPanel"),
  paperForm: document.getElementById("paperForm"),
  paperId: document.getElementById("paperId"),
  paperExam: document.getElementById("paperExam"),
  paperYear: document.getElementById("paperYear"),
  paperSubject: document.getElementById("paperSubject"),
  paperPdfUrl: document.getElementById("paperPdfUrl"),
  paperDescription: document.getElementById("paperDescription"),
  // Jobs editor
  jobsEditorPanel: document.getElementById("jobsEditorPanel"),
  jobForm: document.getElementById("jobForm"),
  jobId: document.getElementById("jobId"),
  jobTitle: document.getElementById("jobTitle"),
  jobSlug: document.getElementById("jobSlug"),
  jobSource: document.getElementById("jobSource"),
  jobVacancy: document.getElementById("jobVacancy"),
  jobOverview: document.getElementById("jobOverview"),
  jobApplyLink: document.getElementById("jobApplyLink"),
  jobFeatured: document.getElementById("jobFeatured"),
  // Buttons
  newItemBtn: document.getElementById("newItemBtn"),
  exportBtn: document.getElementById("exportBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  previewBtn: document.getElementById("previewBtn"),
  closePreview: document.getElementById("closePreview"),
};

/**
 * Simple markdown to HTML converter
 */
function markdownToHtml(markdown) {
  if (!markdown) return "";

  let html = markdown
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>',
    )
    // Unordered lists
    .replace(/^\- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    // Ordered lists
    .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
    // Paragraphs
    .replace(/\n\n/g, "</p><p>")
    // Line breaks
    .replace(/\n/g, "<br>");

  // Wrap in paragraph if not starting with block element
  if (
    !html.startsWith("<h") &&
    !html.startsWith("<ul") &&
    !html.startsWith("<ol")
  ) {
    html = "<p>" + html + "</p>";
  }

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p><br><\/p>/g, "");

  // Handle tables (basic)
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
 * Count words in text
 */
function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);
}

/**
 * Generate unique blog ID
 */
function generateId() {
  return "blog-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

/**
 * Load blogs from localStorage
 */
function loadBlogs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    blogs = stored ? JSON.parse(stored) : [];
  } catch (e) {
    blogs = [];
  }
}

/**
 * Save blogs to localStorage
 */
/**
 * Save blogs to localStorage
 */
function saveBlogs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  } catch (e) {
    console.error("Failed to save blogs:", e);
  }
}

/**
 * Load papers from localStorage
 */
function loadPapers() {
  try {
    const stored = localStorage.getItem(PAPERS_STORAGE_KEY);
    papers = stored ? JSON.parse(stored) : [];
  } catch (e) {
    papers = [];
  }
}

/**
 * Save papers to localStorage
 */
function savePapers() {
  try {
    localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(papers));
  } catch (e) {
    console.error("Failed to save papers:", e);
  }
}

/**
 * Load jobs from localStorage
 */
function loadJobs() {
  try {
    const stored = localStorage.getItem(JOBS_STORAGE_KEY);
    jobs = stored ? JSON.parse(stored) : [];
  } catch (e) {
    jobs = [];
  }
}

/**
 * Save jobs to localStorage
 */
function saveJobs() {
  try {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error("Failed to save jobs:", e);
  }
}

/**
 * Render item list based on active tab
 */
function renderItemList() {
  if (activeTab === "blogs") {
    renderBlogList();
  } else if (activeTab === "jobs") {
    renderJobList();
  } else if (activeTab === "papers") {
    renderPaperList();
  }
}

/**
 * Render blog list
 */
function renderBlogList() {
  elements.sidebarTitle.textContent = "Published Blogs";

  if (blogs.length === 0) {
    elements.itemList.innerHTML =
      '<p class="no-items">No blogs yet. Create your first blog!</p>';
    return;
  }

  const html = blogs
    .map(
      (blog) => `
        <div class="item-list-item ${currentBlogId === blog.id ? "active" : ""}" data-id="${blog.id}">
            <h4 class="item-list-title">${escapeHtml(blog.title)}</h4>
            <span class="item-list-meta">/${blog.slug}</span>
            <div class="item-list-actions">
                <button class="edit-btn" data-id="${blog.id}">Edit</button>
                <button class="delete-btn" data-id="${blog.id}">Delete</button>
            </div>
        </div>
    `,
    )
    .join("");

  elements.itemList.innerHTML = html;

  // Add event listeners
  elements.itemList.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editBlog(btn.dataset.id));
  });

  elements.itemList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteBlog(btn.dataset.id));
  });
}

/**
 * Render job list
 */
/**
 * Render job list
 */
function renderJobList() {
  elements.sidebarTitle.textContent = "Published Jobs";

  if (jobs.length === 0) {
    elements.itemList.innerHTML =
      '<p class="no-items">No jobs yet. Add your first job!</p>';
    return;
  }

  const html = jobs
    .map(
      (job) => `
        <div class="item-list-item ${currentJobId === job.id ? "active" : ""}" data-id="${job.id}">
            <h4 class="item-list-title">${escapeHtml(job.title)}</h4>
            <span class="item-list-meta">${job.source} • ${job.vacancy} vacancies</span>
            <div class="item-list-actions">
                <button class="edit-btn" data-id="${job.id}" data-type="job">Edit</button>
                <button class="delete-btn" data-id="${job.id}" data-type="job">Delete</button>
            </div>
        </div>
    `,
    )
    .join("");

  elements.itemList.innerHTML = html;

  // Add event listeners
  elements.itemList.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editJob(btn.dataset.id));
  });

  elements.itemList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteJob(btn.dataset.id));
  });
}

/**
 * Render paper list
 */
function renderPaperList() {
  elements.sidebarTitle.textContent = "Published Papers";

  if (papers.length === 0) {
    elements.itemList.innerHTML =
      '<p class="no-items">No papers yet. Add your first paper!</p>';
    return;
  }

  const html = papers
    .map(
      (paper) => `
        <div class="item-list-item ${currentPaperId === paper.id ? "active" : ""}" data-id="${paper.id}">
            <h4 class="item-list-title">${escapeHtml(paper.exam)} ${paper.year}</h4>
            <span class="item-list-meta">${paper.subject}</span>
            <div class="item-list-actions">
                <button class="edit-btn" data-id="${paper.id}" data-type="paper">Edit</button>
                <button class="delete-btn" data-id="${paper.id}" data-type="paper">Delete</button>
            </div>
        </div>
    `,
    )
    .join("");

  elements.itemList.innerHTML = html;

  // Add event listeners
  elements.itemList.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editPaper(btn.dataset.id));
  });

  elements.itemList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deletePaper(btn.dataset.id));
  });
}

/**
 * Clear form
 */
/**
 * Clear form
 */
function clearForm() {
  if (activeTab === "blogs") {
    currentBlogId = null;
    elements.blogId.value = "";
    elements.blogTitle.value = "";
    elements.blogSlug.value = "";
    elements.metaTitle.value = "";
    elements.metaDescription.value = "";
    elements.primaryKeyword.value = "";
    elements.secondaryKeywords.value = "";
    elements.blogContent.value = "";
    elements.relatedJobs.value = "";
    elements.relatedBlogs.value = "";
    updateCounts();
    renderBlogList();
  } else if (activeTab === "papers") {
    currentPaperId = null;
    elements.paperId.value = "";
    elements.paperExam.value = "";
    elements.paperYear.value = "";
    elements.paperSubject.value = "";
    elements.paperPdfUrl.value = "";
    elements.paperDescription.value = "";
    renderPaperList();
  } else if (activeTab === "jobs") {
    currentJobId = null;
    elements.jobId.value = "";
    elements.jobTitle.value = "";
    elements.jobSlug.value = "";
    elements.jobSource.value = "";
    elements.jobVacancy.value = "";
    elements.jobOverview.value = "";
    elements.jobApplyLink.value = "";
    elements.jobFeatured.checked = false;
    renderJobList();
  }
}

/**
 * Load blog into form
 */
function editBlog(id) {
  const blog = blogs.find((b) => b.id === id);
  if (!blog) return;

  currentBlogId = id;
  elements.blogId.value = id;
  elements.blogTitle.value = blog.title || "";
  elements.blogSlug.value = blog.slug || "";
  elements.metaTitle.value = blog.metaTitle || "";
  elements.metaDescription.value = blog.metaDescription || "";
  elements.primaryKeyword.value = blog.primaryKeyword || "";
  elements.secondaryKeywords.value = (blog.secondaryKeywords || []).join(", ");
  elements.blogContent.value = blog.content || "";
  elements.relatedJobs.value = (blog.relatedJobs || []).join(", ");
  elements.relatedBlogs.value = (blog.relatedBlogs || []).join(", ");

  updateCounts();
  renderBlogList();
  hidePreview();
}

/**
 * Delete blog
 */
function deleteBlog(id) {
  if (!confirm("Are you sure you want to delete this blog?")) return;

  blogs = blogs.filter((b) => b.id !== id);
  saveBlogs();

  if (currentBlogId === id) {
    clearForm();
  }

  renderBlogList();
}

/**
 * Save blog
 */
function saveBlog(e) {
  e.preventDefault();

  const wordCount = countWords(elements.blogContent.value);
  if (wordCount < 800) {
    alert(
      `Blog content must be at least 800 words. Current: ${wordCount} words.`,
    );
    return;
  }

  const blog = {
    id: currentBlogId || generateId(),
    title: elements.blogTitle.value.trim(),
    slug: elements.blogSlug.value.trim(),
    metaTitle: elements.metaTitle.value.trim(),
    metaDescription: elements.metaDescription.value.trim(),
    primaryKeyword: elements.primaryKeyword.value.trim(),
    secondaryKeywords: elements.secondaryKeywords.value
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k),
    content: elements.blogContent.value,
    relatedJobs: elements.relatedJobs.value
      .split(",")
      .map((j) => j.trim())
      .filter((j) => j),
    relatedBlogs: elements.relatedBlogs.value
      .split(",")
      .map((b) => b.trim())
      .filter((b) => b),
    createdAt: currentBlogId
      ? blogs.find((b) => b.id === currentBlogId)?.createdAt ||
        new Date().toISOString()
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (currentBlogId) {
    const index = blogs.findIndex((b) => b.id === currentBlogId);
    if (index !== -1) {
      blogs[index] = blog;
    }
  } else {
    blogs.push(blog);
  }

  saveBlogs();
  currentBlogId = blog.id;
  renderBlogList();
  alert("Blog saved successfully!");
}

function savePaper(e) {
  e.preventDefault();

  const paper = {
    id: currentPaperId || "paper-" + Date.now(),
    exam: elements.paperExam.value,
    year: elements.paperYear.value,
    subject: elements.paperSubject.value,
    pdfUrl: elements.paperPdfUrl.value,
    description: elements.paperDescription.value,
    createdAt: new Date().toISOString(),
  };

  if (currentPaperId) {
    const index = papers.findIndex((p) => p.id === currentPaperId);
    if (index !== -1) papers[index] = paper;
  } else {
    papers.push(paper);
  }

  savePapers();
  currentPaperId = paper.id;
  renderPaperList();
  alert("Paper saved successfully!");
}

function saveJob(e) {
  e.preventDefault();

  const job = {
    id: currentJobId || "job-" + Date.now(),
    title: elements.jobTitle.value,
    slug: elements.jobSlug.value,
    source: elements.jobSource.value,
    vacancy: elements.jobVacancy.value,
    overview: elements.jobOverview.value,
    applyLink: elements.jobApplyLink.value,
    featured: elements.jobFeatured.checked,
    createdAt: new Date().toISOString(),
  };

  if (currentJobId) {
    const index = jobs.findIndex((j) => j.id === currentJobId);
    if (index !== -1) jobs[index] = job;
  } else {
    jobs.push(job);
  }

  saveJobs();
  currentJobId = job.id;
  renderJobList();
  alert("Job saved successfully!");
}

function editPaper(id) {
  const paper = papers.find((p) => p.id === id);
  if (!paper) return;

  currentPaperId = id;
  elements.paperId.value = id;
  elements.paperExam.value = paper.exam;
  elements.paperYear.value = paper.year;
  elements.paperSubject.value = paper.subject;
  elements.paperPdfUrl.value = paper.pdfUrl || "";
  elements.paperDescription.value = paper.description || "";

  renderPaperList();
}

function deletePaper(id) {
  if (!confirm("Delete this paper?")) return;
  papers = papers.filter((p) => p.id !== id);
  savePapers();
  if (currentPaperId === id) clearForm();
  renderPaperList();
}

function editJob(id) {
  const job = jobs.find((j) => j.id === id);
  if (!job) return;

  currentJobId = id;
  elements.jobId.value = id;
  elements.jobTitle.value = job.title;
  elements.jobSlug.value = job.slug;
  elements.jobSource.value = job.source;
  elements.jobVacancy.value = job.vacancy;
  elements.jobOverview.value = job.overview;
  elements.jobApplyLink.value = job.applyLink;
  elements.jobFeatured.checked = job.featured;

  renderJobList();
}

function deleteJob(id) {
  if (!confirm("Delete this job?")) return;
  jobs = jobs.filter((j) => j.id !== id);
  saveJobs();
  if (currentJobId === id) clearForm();
  renderJobList();
}

/**
 * Show preview
 */
function showPreview() {
  const html = markdownToHtml(elements.blogContent.value);
  elements.previewContent.innerHTML = `
        <h1>${escapeHtml(elements.blogTitle.value)}</h1>
        <div class="blog-meta">
            <span class="blog-keyword">${escapeHtml(elements.primaryKeyword.value)}</span>
        </div>
        <div class="blog-body">${html}</div>
    `;
  elements.previewPanel.classList.remove("hidden");
}

/**
 * Hide preview
 */
function hidePreview() {
  elements.previewPanel.classList.add("hidden");
}

/**
 * Export data based on active tab
 */
function exportData() {
  let data, filename;

  if (activeTab === "blogs") {
    data = blogs;
    filename = "blogs.json";
  } else if (activeTab === "jobs") {
    data = jobs;
    filename = "jobs.json";
  } else if (activeTab === "papers") {
    data = papers;
    filename = "papers.json";
  } else {
    return;
  }

  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Update character/word counts
 */
function updateCounts() {
  elements.metaTitleCount.textContent = elements.metaTitle.value.length;
  elements.metaDescCount.textContent = elements.metaDescription.value.length;
  elements.wordCount.textContent = countWords(elements.blogContent.value);
}

/**
 * Insert markdown syntax
 */
function insertMarkdown(action) {
  const textarea = elements.blogContent;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  let replacement = "";

  switch (action) {
    case "bold":
      replacement = `**${selected || "bold text"}**`;
      break;
    case "italic":
      replacement = `*${selected || "italic text"}*`;
      break;
    case "h2":
      replacement = `\n## ${selected || "Heading 2"}\n`;
      break;
    case "h3":
      replacement = `\n### ${selected || "Heading 3"}\n`;
      break;
    case "ul":
      replacement = `\n- ${selected || "List item"}\n`;
      break;
    case "ol":
      replacement = `\n1. ${selected || "List item"}\n`;
      break;
    case "link":
      replacement = `[${selected || "Link text"}](https://example.com)`;
      break;
    case "table":
      replacement = `\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n`;
      break;
  }

  textarea.value =
    textarea.value.substring(0, start) +
    replacement +
    textarea.value.substring(end);
  textarea.focus();
  updateCounts();
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
 * Handle login
 */
function handleLogin(e) {
  e.preventDefault();

  if (elements.adminPassword.value === ADMIN_PASSWORD) {
    elements.loginScreen.classList.add("hidden");
    elements.adminPanel.classList.remove("hidden");
    sessionStorage.setItem("admin-logged-in", "true");
  } else {
    elements.loginError.classList.remove("hidden");
    elements.adminPassword.value = "";
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  sessionStorage.removeItem("admin-logged-in");
  elements.adminPanel.classList.add("hidden");
  elements.loginScreen.classList.remove("hidden");
  elements.adminPassword.value = "";
}

/**
 * Check session
 */
function checkSession() {
  if (sessionStorage.getItem("admin-logged-in") === "true") {
    elements.loginScreen.classList.add("hidden");
    elements.adminPanel.classList.remove("hidden");
  }
}

/**
 * Switch tab
 */
function switchTab(tabName) {
  console.log("Switching to tab:", tabName);
  activeTab = tabName;

  // Update tab buttons
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.classList.remove("active");
    if (tab.dataset.tab === tabName) {
      tab.classList.add("active");
    }
  });

  // Hide all editor panels
  if (elements.editorPanel) elements.editorPanel.classList.add("hidden");
  if (elements.papersEditorPanel)
    elements.papersEditorPanel.classList.add("hidden");
  if (elements.jobsEditorPanel)
    elements.jobsEditorPanel.classList.add("hidden");

  // Show correct editor based on tab
  if (tabName === "blogs" && elements.editorPanel) {
    elements.editorPanel.classList.remove("hidden");
  } else if (tabName === "papers" && elements.papersEditorPanel) {
    elements.papersEditorPanel.classList.remove("hidden");
  } else if (tabName === "jobs" && elements.jobsEditorPanel) {
    elements.jobsEditorPanel.classList.remove("hidden");
  }

  // Render appropriate list
  renderItemList();
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
  // Login
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.logoutBtn.addEventListener("click", handleLogout);

  // Tab switching
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // New item button
  if (elements.newItemBtn) {
    elements.newItemBtn.addEventListener("click", clearForm);
  }

  elements.exportBtn.addEventListener("click", exportData);
  elements.blogForm.addEventListener("submit", saveBlog);

  // Preview
  elements.previewBtn.addEventListener("click", showPreview);
  elements.closePreview.addEventListener("click", hidePreview);

  // Auto-generate slug
  elements.blogTitle.addEventListener("input", () => {
    if (!currentBlogId) {
      elements.blogSlug.value = generateSlug(elements.blogTitle.value);
    }
  });

  // Jobs auto-slug
  if (elements.jobTitle) {
    elements.jobTitle.addEventListener("input", () => {
      if (!currentJobId) {
        elements.jobSlug.value = generateSlug(elements.jobTitle.value);
      }
    });
  }

  // Save handlers
  if (elements.paperForm)
    elements.paperForm.addEventListener("submit", savePaper);
  if (elements.jobForm) elements.jobForm.addEventListener("submit", saveJob);

  // Character counts
  elements.metaTitle.addEventListener("input", updateCounts);
  elements.metaDescription.addEventListener("input", updateCounts);
  elements.blogContent.addEventListener("input", updateCounts);

  // Toolbar buttons
  document.querySelectorAll(".toolbar-btn").forEach((btn) => {
    btn.addEventListener("click", () => insertMarkdown(btn.dataset.action));
  });
}

/**
 * Initialize
 */
function init() {
  theme.init();
  checkSession();
  loadBlogs();
  loadPapers();
  loadJobs();
  renderItemList();
  initEventListeners();
}

init();

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
let resources = [];
let currentBlogId = null;
let currentJobId = null;
let currentPaperId = null;
let currentResourceId = null;
let activeTab = "blogs";

/**
 * Show save prompt after deletion
 */
function showSavePrompt(deletedId) {
  if (activeTab === "blogs") renderBlogList();
  else if (activeTab === "jobs") renderJobList();
  else if (tabName === "papers") renderPaperList();
  else if (tabName === "papers") renderPaperList();

  const uniqueId = "save-btn-" + Date.now();
  const promptHtml = `
    <div class="item-list-item deleted-prompt" style="background-color: #fee2e2; border-color: #ef4444; cursor: default;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 0.8rem; font-weight: 600; color: #b91c1c;">Item Deleted</span>
        <span style="font-size: 0.75rem; color: #b91c1c;">To apply changes to the live site, you must save the JSON.</span>
        <button id="${uniqueId}" class="admin-btn admin-btn-primary" style="font-size: 0.75rem; padding: 4px 8px; align-self: flex-start; background: #dc2626;">Download / Save JSON Now</button>
      </div>
    </div>
  `;

  elements.itemList.insertAdjacentHTML("afterbegin", promptHtml);
  document.getElementById(uniqueId).addEventListener("click", exportData);
}

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
  paperJobTypes: document.getElementById("paperJobTypes"),
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
  jobType: document.getElementById("jobType"),
  jobStatus: document.getElementById("jobStatus"),
  jobExamYear: document.getElementById("jobExamYear"),
  jobTypes: document.getElementById("jobTypes"),
  jobTitleHi: document.getElementById("jobTitleHi"),
  jobOverviewHi: document.getElementById("jobOverviewHi"),
  jobFeatured: document.getElementById("jobFeatured"),
  // Buttons
  newItemBtn: document.getElementById("newItemBtn"),
  newItemBtn: document.getElementById("newItemBtn"),
  importBtn: document.getElementById("importBtn"),
  // exportBtn: document.getElementById("exportBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  previewBtn: document.getElementById("previewBtn"),
  closePreview: document.getElementById("closePreview"),
  // Resources editor
  resourcesEditorPanel: document.getElementById("resourcesEditorPanel"),
  resourceForm: document.getElementById("resourceForm"),
  resourceId: document.getElementById("resourceId"),
  resourceTitle: document.getElementById("resourceTitle"),
  resourceLink: document.getElementById("resourceLink"),
  resourceCategory: document.getElementById("resourceCategory"),
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
/**
 * Load blogs from Server
 */
async function loadBlogs() {
  try {
    const response = await fetch("blogs.json?t=" + Date.now());
    blogs = response.ok ? await response.json() : [];
  } catch (e) {
    console.warn("Failed to load blogs:", e);
    blogs = [];
  }
}

/**
 * Save blogs to localStorage
 */
/**
 * Save blogs to localStorage
 */
// Local storage save removed

/**
 * Load papers from localStorage
 */
/**
 * Load papers from Server
 */
async function loadPapers() {
  try {
    const response = await fetch("papers.json?t=" + Date.now());
    papers = response.ok ? await response.json() : [];
  } catch (e) {
    console.warn("Failed to load papers:", e);
    papers = [];
  }
}

/**
 * Load resources from Server
 */
async function loadResources() {
  try {
    const response = await fetch("resources.json?t=" + Date.now());
    resources = response.ok ? await response.json() : [];
  } catch (e) {
    console.warn("Failed to load resources:", e);
    resources = [];
  }
}

/**
 * Save papers to localStorage
 */
// Local storage save removed

/**
 * Load jobs from localStorage
 */
/**
 * Load jobs from Server
 */
async function loadJobs() {
  try {
    const response = await fetch("jobs.json?t=" + Date.now());
    jobs = response.ok ? await response.json() : [];
  } catch (e) {
    console.warn("Failed to load jobs:", e);
    jobs = [];
  }
}

/**
 * Update Organization Datalist dynamically
 */
function updateOrgDatalist() {
  if (!jobs.length) return;

  const sources = new Set([
    "SSC",
    "IBPS",
    "Railway",
    "UPSC",
    "State Govt",
    "Defence",
    "Police",
    "Teaching",
  ]);

  jobs.forEach((job) => {
    if (job.source) sources.add(job.source);
  });

  const datalist = document.getElementById("orgs");
  if (datalist) {
    datalist.innerHTML = Array.from(sources)
      .sort()
      .map((src) => `<option value="${src}"></option>`)
      .join("");
  }
}

/**
 * Save jobs to localStorage
 */
// Local storage save removed

/**
 * Render item list based on active tab
 */
function renderItemList() {
  if (activeTab === "blogs") {
    renderBlogList();
  } else if (["jobs", "admit_cards", "results"].includes(activeTab)) {
    renderJobList();
    updateOrgDatalist();
  } else if (activeTab === "papers") {
    renderPaperList();
  } else if (activeTab === "resources") {
    renderResourceList();
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
  const typeMap = {
    jobs: "job",
    admit_cards: "admit_card",
    results: "result",
  };
  const currentType = typeMap[activeTab];
  elements.sidebarTitle.textContent = `Published ${activeTab.replace("_", " ")}`;

  const filteredJobs = jobs.filter((j) => j.type === currentType);

  if (filteredJobs.length === 0) {
    elements.itemList.innerHTML = `<p class="no-items">No ${activeTab.replace("_", " ")} yet. Add your first one!</p>`;
    return;
  }

  const html = filteredJobs
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
 * Render resource list
 */
function renderResourceList() {
  elements.sidebarTitle.textContent = "Published Resources";

  if (resources.length === 0) {
    elements.itemList.innerHTML =
      '<p class="no-items">No resources yet. Add your first resource!</p>';
    return;
  }

  const html = resources
    .map(
      (res) => `
        <div class="item-list-item ${currentResourceId === res.id ? "active" : ""}" data-id="${res.id}">
            <h4 class="item-list-title">${escapeHtml(res.title)}</h4>
            <span class="item-list-meta">${res.category}</span>
            <div class="item-list-actions">
                <button class="edit-btn" data-id="${res.id}" data-type="resource">Edit</button>
                <button class="delete-btn" data-id="${res.id}" data-type="resource">Delete</button>
            </div>
        </div>
    `,
    )
    .join("");

  elements.itemList.innerHTML = html;

  // Add event listeners
  elements.itemList.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editResource(btn.dataset.id));
  });

  elements.itemList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteResource(btn.dataset.id));
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
  } else if (activeTab === "resources") {
    currentResourceId = null;
    elements.resourceId.value = "";
    elements.resourceTitle.value = "";
    elements.resourceLink.value = "";
    elements.resourceCategory.value = "syllabus";
    renderResourceList();
  } else if (["jobs", "admit_cards", "results"].includes(activeTab)) {
    currentJobId = null;
    elements.jobId.value = "";
    elements.jobTitle.value = "";
    elements.jobSlug.value = "";
    elements.jobSource.value = "";
    elements.jobVacancy.value = "";
    elements.jobOverview.value = "";
    elements.jobApplyLink.value = "";
    const typeMap = {
      jobs: "job",
      admit_cards: "admit_card",
      results: "result",
    };
    elements.jobType.value = typeMap[activeTab];
    elements.jobStatus.value =
      activeTab === "results"
        ? "out"
        : activeTab === "admit_cards"
          ? "soon"
          : "live";
    elements.jobExamYear.value = new Date().getFullYear().toString();
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
  // saveBlogs(); removed

  if (currentBlogId === id) {
    clearForm();
  }

  renderBlogList();
  saveDataToServer("blogs"); // Auto-save
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

  // saveBlogs(); removed
  currentBlogId = blog.id;
  renderBlogList();
  saveDataToServer("blogs"); // Auto-save to server
  alert("Blog saved successfully!");
}

function saveResource(e) {
  e.preventDefault();

  const resource = {
    id: currentResourceId || "res-" + Date.now(),
    title: elements.resourceTitle.value.trim(),
    link: elements.resourceLink.value.trim(),
    category: elements.resourceCategory.value,
    createdAt: new Date().toISOString(),
  };

  if (currentResourceId) {
    const index = resources.findIndex((r) => r.id === currentResourceId);
    if (index !== -1) resources[index] = resource;
  } else {
    resources.push(resource);
  }

  currentResourceId = resource.id;
  renderResourceList();
  saveDataToServer("resources");
  alert("Resource saved successfully!");
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
    syllabus: null,
    job_types: elements.paperJobTypes.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),

    // SEO Fields (Safe Access)
    metaTitle: document.getElementById("paperMetaTitle")?.value || "",
    metaDesc: document.getElementById("paperMetaDesc")?.value || "",
    keywords: document.getElementById("paperKeywords")?.value || "",

    createdAt: new Date().toISOString(),
  };

  if (currentPaperId) {
    const index = papers.findIndex((p) => p.id === currentPaperId);
    if (index !== -1) papers[index] = paper;
  } else {
    papers.push(paper);
  }

  currentPaperId = paper.id;
  renderPaperList();
  saveDataToServer("papers"); // Auto-save to server
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
    type: elements.jobType.value,
    status: elements.jobStatus.value,
    exam_year: elements.jobExamYear.value,
    syllabus: null,
    job_types: elements.jobTypes.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    title_hi: elements.jobTitleHi.value,
    overview_hi: elements.jobOverviewHi.value,
    featured: elements.jobFeatured.checked,
    createdAt: new Date().toISOString(),
  };

  if (currentJobId) {
    const index = jobs.findIndex((j) => j.id === currentJobId);
    if (index !== -1) jobs[index] = job;
  } else {
    jobs.push(job);
  }

  // saveJobs(); removed
  currentJobId = job.id;
  renderJobList();
  saveDataToServer("jobs"); // Auto-save to server
  alert("Job saved successfully!");
}

function editPaper(id) {
  const paper = papers.find((p) => p.id === id);
  if (!paper) return;

  currentPaperId = id;
  elements.paperId.value = id;
  elements.paperExam.value = paper.exam;
  elements.paperYear.value = paper.year || "";
  elements.paperSubject.value = paper.subject || "";
  elements.paperPdfUrl.value = paper.pdfUrl || "";
  elements.paperDescription.value = paper.description || "";
  elements.paperJobTypes.value = paper.job_types
    ? paper.job_types.join(", ")
    : "";

  // SEO Fields
  if (document.getElementById("paperMetaTitle")) {
    document.getElementById("paperMetaTitle").value = paper.metaTitle || "";
    document.getElementById("paperMetaDesc").value = paper.metaDesc || "";
    document.getElementById("paperKeywords").value = paper.keywords || "";
  }

  showPanel("papersEditorPanel");
  renderPaperList();
}

function editResource(id) {
  const res = resources.find((r) => r.id === id);
  if (!res) return;

  currentResourceId = id;
  elements.resourceId.value = id;
  elements.resourceTitle.value = res.title;
  elements.resourceLink.value = res.link;
  elements.resourceCategory.value = res.category;

  renderResourceList();
}

function deleteResource(id) {
  if (!confirm("Delete this resource?")) return;
  resources = resources.filter((r) => r.id !== id);
  saveDataToServer("resources");
  renderResourceList();
}

function deletePaper(id) {
  if (!confirm("Delete this paper?")) return;
  papers = papers.filter((p) => p.id !== id);
  // savePapers(); removed
  saveDataToServer("papers"); // Auto-save
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
  elements.jobOverview.value = job.overview || "";
  elements.jobApplyLink.value = job.applyLink || "";
  elements.jobType.value = job.type || "job";
  elements.jobStatus.value = job.status || "live";
  elements.jobExamYear.value = job.exam_year || "2026";
  elements.jobSyllabus.value = job.syllabus
    ? JSON.stringify(job.syllabus, null, 2)
    : "";
  elements.jobTypes.value = job.job_types ? job.job_types.join(", ") : "";
  elements.jobTitleHi.value = job.title_hi || "";
  elements.jobOverviewHi.value = job.overview_hi || "";
  elements.jobFeatured.checked = job.featured || false;

  renderJobList();
}

function deleteJob(id) {
  if (!confirm("Delete this job?")) return;
  jobs = jobs.filter((j) => j.id !== id);
  // saveJobs(); removed
  saveDataToServer("jobs"); // Auto-save
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
  } else if (activeTab === "resources") {
    data = resources;
    filename = "resources.json";
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
 * Save data to Node.js Server
 */
async function saveDataToServer(type) {
  let data;
  if (type === "blogs") data = blogs;
  else if (type === "jobs") data = jobs;
  else if (type === "papers") data = papers;
  else if (type === "resources") data = resources;

  try {
    const response = await fetch(`/api/save/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`${type} saved to server.`);
      // Optional: Show a small toast instead of alert to be less annoying
    } else {
      alert(`Failed to save ${type}: ${result.message}`);
    }
  } catch (error) {
    console.error("Save error:", error);
    alert("Error saving to server. Ensure Node.js server is running.");
  }
}

/**
 * Import data from static JSON
 */
async function importData() {
  let filename;
  if (activeTab === "blogs") filename = "blogs.json";
  else if (activeTab === "jobs") filename = "jobs.json";
  else if (activeTab === "papers") filename = "papers.json";

  if (
    !confirm(`Import data from ${filename}? This will overwrite current list.`)
  )
    return;

  try {
    const response = await fetch(filename);
    if (!response.ok) throw new Error("File not found");
    const data = await response.json();

    if (activeTab === "blogs") {
      blogs = data;
      // saveBlogs(); removed
      renderBlogList();
    } else if (activeTab === "jobs") {
      jobs = data;
      // saveJobs(); removed
      renderJobList();
    } else if (activeTab === "papers") {
      papers = data;
      // savePapers(); removed
      renderPaperList();
    } else if (activeTab === "resources") {
      resources = data;
      renderResourceList();
    }
    alert("Data imported successfully!");
  } catch (error) {
    alert("Error importing data: " + error.message);
  }
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
  if (elements.resourcesEditorPanel)
    elements.resourcesEditorPanel.classList.add("hidden");

  // Show correct editor based on tab
  if (tabName === "blogs" && elements.editorPanel) {
    elements.editorPanel.classList.remove("hidden");
  } else if (tabName === "papers" && elements.papersEditorPanel) {
    elements.papersEditorPanel.classList.remove("hidden");
  } else if (
    ["jobs", "admit_cards", "results"].includes(tabName) &&
    elements.jobsEditorPanel
  ) {
    elements.jobsEditorPanel.classList.remove("hidden");

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

  elements.importBtn.addEventListener("click", importData);
  // elements.exportBtn.addEventListener("click", exportData);
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
  if (elements.resourceForm)
    elements.resourceForm.addEventListener("submit", saveResource);

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
 * Parse JSON safely
 */
function parseJSON(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    console.error("Invalid JSON:", str);
    return fallback;
  }
}

/**
 * Initialize
 */
/**
 * Initialize
 */
async function init() {
  theme.init();
  checkSession();
  await Promise.all([loadBlogs(), loadPapers(), loadJobs(), loadResources()]);
  updateOrgDatalist();
  renderItemList();
  initEventListeners();
}

init();

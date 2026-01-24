/**
 * Job Alert Application
 * Main entry point that wires together all hooks and UI
 */

import { useTheme } from "./hooks/theme.js";
import { useJobs } from "./hooks/jobs.js";
import { useFilters } from "./hooks/filters.js";
import { SEO } from "./hooks/pseo.js";

// Initialize hooks
const theme = useTheme();
const jobs = useJobs();
const filters = useFilters();

// DOM Elements
const elements = {
  themeToggle: document.getElementById("themeToggle"),
  searchInput: document.getElementById("searchInput"),
  sourceFilter: document.getElementById("sourceFilter"),
  dateFilter: document.getElementById("dateFilter"),
  clearFilters: document.getElementById("clearFilters"),
  jobsGrid: document.getElementById("jobsGrid"),
  emptyState: document.getElementById("emptyState"),
  resultsCount: document.getElementById("resultsCount"),
};

/**
 * Create skeleton loader HTML
 */
function createSkeletonCard() {
  return `
        <div class="skeleton-card">
            <div class="skeleton-header">
                <div class="skeleton skeleton-badge"></div>
                <div class="skeleton skeleton-date"></div>
            </div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-title-2"></div>
            <div class="skeleton skeleton-btn"></div>
        </div>
    `;
}

/**
 * Show skeleton loaders
 */
function showSkeletons(count = 6) {
  const skeletons = Array(count)
    .fill(null)
    .map(() => createSkeletonCard())
    .join("");
  elements.jobsGrid.innerHTML = skeletons;
  elements.emptyState.classList.add("hidden");
}

/**
 * Create job card HTML
 */
function createJobCard(job) {
  const formattedDate = jobs.formatJobDate(job.date);

  return `
        <article class="job-card" data-job-id="${job.id}">
            <div class="job-card-header">
                <span class="job-source">${escapeHtml(job.source)}</span>
                <time class="job-date" datetime="${job.date}">${formattedDate}</time>
            </div>
            <h2 class="job-title">${escapeHtml(job.title)}</h2>
            <div class="job-card-footer">
                <a href="job.html?id=${job.id}" class="view-details-btn">
                    View Details
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </div>
        </article>
    `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Render jobs to the grid
 */
function renderJobs(jobsList) {
  // Sort jobs: Newest first (Robust Sort)
  jobsList.sort((a, b) => {
    const d1 = new Date(a.date || a.createdAt);
    const d2 = new Date(b.date || b.createdAt);

    // Handle invalid dates
    const t1 = isNaN(d1.getTime()) ? 0 : d1.getTime();
    const t2 = isNaN(d2.getTime()) ? 0 : d2.getTime();

    return t2 - t1; // Descending (Newest first)
  });

  console.log(
    "Job Sort Order:",
    jobsList.map((j) => `${j.title} (${j.date})`),
  );

  if (jobsList.length === 0) {
    elements.jobsGrid.innerHTML = "";
    elements.emptyState.classList.remove("hidden");
    elements.resultsCount.textContent = "No jobs found";
    return;
  }

  elements.emptyState.classList.add("hidden");
  elements.jobsGrid.innerHTML = jobsList
    .map((job) => createJobCard(job))
    .join("");

  const totalJobs = jobs.getCount();
  const filteredCount = jobsList.length;

  if (filters.hasActiveFilters()) {
    elements.resultsCount.textContent = `Showing ${filteredCount} of ${totalJobs} jobs`;
  } else {
    elements.resultsCount.textContent = `${totalJobs} jobs available`;
  }
}

/**
 * Populate source filter dropdown
 */
function populateSourceFilter(sources) {
  const currentValue = elements.sourceFilter.value;

  // Clear existing options except the first one
  while (elements.sourceFilter.options.length > 1) {
    elements.sourceFilter.remove(1);
  }

  // Add source options
  sources.forEach((source) => {
    const option = document.createElement("option");
    option.value = source;
    option.textContent = source;
    elements.sourceFilter.appendChild(option);
  });

  // Restore selection if it still exists
  if (sources.includes(currentValue)) {
    elements.sourceFilter.value = currentValue;
  }
}

/**
 * Apply filters and re-render
 */
function applyFiltersAndRender() {
  const { jobs: allJobs } = jobs.getState();
  const filteredJobs = filters.filterJobs(allJobs);
  renderJobs(filteredJobs);
}

/**
 * Reset filter UI elements
 */
function resetFilterUI() {
  elements.searchInput.value = "";
  elements.sourceFilter.value = "";
  elements.dateFilter.value = "";
}

/**
 * Debounce function for search input
 */
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
  // Theme toggle
  elements.themeToggle.addEventListener("click", () => {
    theme.toggleTheme();
  });

  // Search input with debounce
  const debouncedSearch = debounce((value) => {
    filters.setSearch(value);
  }, 300);

  elements.searchInput.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
  });

  // Source filter
  elements.sourceFilter.addEventListener("change", (e) => {
    filters.setSource(e.target.value);
  });

  // Date filter
  elements.dateFilter.addEventListener("change", (e) => {
    filters.setDate(e.target.value);
  });

  // Clear filters
  elements.clearFilters.addEventListener("click", () => {
    filters.clearFilters();
    resetFilterUI();
  });
}

/**
 * Subscribe to hook changes
 */
function initSubscriptions() {
  // Subscribe to filter changes
  filters.subscribe(() => {
    applyFiltersAndRender();
  });

  // Subscribe to jobs changes
  jobs.subscribe((state) => {
    if (!state.isLoading && !state.error) {
      populateSourceFilter(jobs.getSources());
      applyFiltersAndRender();
    }
  });
}

/**
 * Initialize the application
 */
async function init() {
  // Initialize theme
  theme.init();

  // Set up event listeners
  initEventListeners();

  // Set up subscriptions
  initSubscriptions();

  // Show loading state
  showSkeletons(6);

  // Check URL params for filters
  const params = new URLSearchParams(window.location.search);
  const sourceParam = params.get("source");

  // Fetch jobs data
  try {
    await jobs.fetchJobs();

    // Apply URL filter if present
    if (sourceParam) {
      // Small delay to ensure sources are populated
      setTimeout(() => {
        if (
          elements.sourceFilter.querySelector(`option[value="${sourceParam}"]`)
        ) {
          elements.sourceFilter.value = sourceParam;
          filters.setSource(sourceParam);

          // Update SEO for this category
          SEO.updateMeta({
            title: `${sourceParam} Jobs 2026 - Latest Notifications | LatestJobs.space`,
            description: `Apply for latest ${sourceParam} Jobs 2026. Get recruitment notifications, exam dates, eligibility, and online application links for ${sourceParam} vacancies.`,
            url: window.location.href,
          });

          SEO.injectSchema({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            headline: `${sourceParam} Jobs 2026`,
            description: `Latest recruitment notifications for ${sourceParam}`,
            url: window.location.href,
          });
        }
      }, 100);
    }
  } catch (error) {
    console.error("Failed to load jobs:", error);
    elements.jobsGrid.innerHTML = "";
    elements.emptyState.classList.remove("hidden");
    elements.emptyState.querySelector(".empty-title").textContent =
      "Failed to Load Jobs";
    elements.emptyState.querySelector(".empty-text").textContent =
      "Please try refreshing the page";
    elements.resultsCount.textContent = "";
  }
}

// Start the application
init();

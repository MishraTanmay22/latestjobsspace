/**
 * Job Detail Page
 * Loads and displays individual job details from jobs.json
 */

import { useTheme } from "./hooks/theme.js";
import { useJobs } from "./hooks/jobs.js";

// Initialize hooks
const theme = useTheme();
const jobs = useJobs();

// DOM Elements
const elements = {
  themeToggle: document.getElementById("themeToggle"),
  breadcrumbTitle: document.getElementById("breadcrumbTitle"),
  jobSkeleton: document.getElementById("jobSkeleton"),
  jobContent: document.getElementById("jobContent"),
  jobError: document.getElementById("jobError"),
  jobSource: document.getElementById("jobSource"),
  jobDate: document.getElementById("jobDate"),
  jobUpdated: document.getElementById("jobUpdated"),
  jobTitle: document.getElementById("jobTitle"),
  jobOverview: document.getElementById("jobOverview"),
  datesTableBody: document.getElementById("datesTableBody"),
  datesSection: document.getElementById("datesSection"),
  feeTableBody: document.getElementById("feeTableBody"),
  feeNote: document.getElementById("feeNote"),
  feeSection: document.getElementById("feeSection"),
  ageList: document.getElementById("ageList"),
  ageSection: document.getElementById("ageSection"),
  vacancyDetails: document.getElementById("vacancyDetails"),
  vacancySection: document.getElementById("vacancySection"),
  eligibilityList: document.getElementById("eligibilityList"),
  eligibilitySection: document.getElementById("eligibilitySection"),
  selectionList: document.getElementById("selectionList"),
  selectionSection: document.getElementById("selectionSection"),
  applyStepsList: document.getElementById("applyStepsList"),
  applySection: document.getElementById("applySection"),
  linksGrid: document.getElementById("linksGrid"),
  linksSection: document.getElementById("linksSection"),
  availablePosts: document.getElementById("availablePosts"),
  postsSection: document.getElementById("postsSection"),
  faqsAccordion: document.getElementById("faqsAccordion"),
  faqsSection: document.getElementById("faqsSection"),
  jobOrg: document.getElementById("jobOrg"),
  jobPostedDate: document.getElementById("jobPostedDate"),
  jobOfficialLink: document.getElementById("jobOfficialLink"),
  applyBtn: document.getElementById("applyBtn"),
  relatedJobs: document.getElementById("relatedJobs"),
  relatedSource: document.getElementById("relatedSource"),
  relatedJobsGrid: document.getElementById("relatedJobsGrid"),
};

/**
 * Get job ID from URL query parameter
 */
function getJobIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return "Not specified";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format relative date
 */
function formatRelativeDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Posted today";
    if (diffDays === 1) return "Posted yesterday";
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    return `Last updated on ${formatDate(dateString)}`;
  } catch {
    return "";
  }
}

/**
 * Update page meta tags for SEO
 */
function updateMetaTags(job) {
  // Update title
  document.title = `${job.title} | Latest Government Job Notification`;

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    const description = job.description
      ? job.description.substring(0, 155) +
        (job.description.length > 155 ? "..." : "")
      : `Apply for ${job.title}. Latest notification from ${job.source}. Check eligibility, important dates, and apply online.`;
    metaDesc.setAttribute("content", description);
  }

  // Update canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute(
      "href",
      `${window.location.origin}${window.location.pathname}?id=${job.id}`,
    );
  }

  // Update structured data
  const schemaScript = document.getElementById("jobSchema");
  if (schemaScript) {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.title,
      description:
        job.description || `Government job notification for ${job.title}`,
      datePosted: job.date,
      hiringOrganization: {
        "@type": "Organization",
        name: job.source,
        sameAs: job.link,
      },
      employmentType: "FULL_TIME",
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
        },
      },
    };
    schemaScript.textContent = JSON.stringify(schema, null, 2);
  }
}

/**
 * Render important dates table
 */
function renderImportantDates(dates) {
  if (!dates || dates.length === 0) {
    elements.datesSection.classList.add("hidden");
    return;
  }

  const rows = dates
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.event)}</td><td>${escapeHtml(item.date)}</td></tr>`,
    )
    .join("");

  elements.datesTableBody.innerHTML = rows;
}

/**
 * Render eligibility list
 */
function renderEligibility(eligibility) {
  if (!eligibility || eligibility.length === 0) {
    elements.eligibilitySection.classList.add("hidden");
    return;
  }

  const items = eligibility
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  elements.eligibilityList.innerHTML = items;
}

/**
 * Render how to apply steps
 */
function renderHowToApply(steps) {
  if (!steps || steps.length === 0) {
    elements.applySection.classList.add("hidden");
    return;
  }

  const items = steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");

  elements.applyStepsList.innerHTML = items;
}

/**
 * Render available posts
 */
function renderAvailablePosts(posts) {
  if (!posts) {
    elements.postsSection.classList.add("hidden");
    return;
  }

  elements.availablePosts.textContent = posts;
}

/**
 * Render application fee table
 */
function renderApplicationFee(fee) {
  if (!fee || !fee.categories || fee.categories.length === 0) {
    elements.feeSection.classList.add("hidden");
    return;
  }

  const rows = fee.categories
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.amount)}</td></tr>`,
    )
    .join("");

  elements.feeTableBody.innerHTML = rows;

  if (fee.note) {
    elements.feeNote.textContent = fee.note;
  } else {
    elements.feeNote.style.display = "none";
  }
}

/**
 * Render age limit section
 */
function renderAgeLimit(ageLimit) {
  if (!ageLimit || ageLimit.length === 0) {
    elements.ageSection.classList.add("hidden");
    return;
  }

  const items = ageLimit.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  elements.ageList.innerHTML = items;
}

/**
 * Render vacancy details
 */
function renderVacancyDetails(vacancy) {
  if (!vacancy) {
    elements.vacancySection.classList.add("hidden");
    return;
  }

  elements.vacancyDetails.textContent = vacancy;
}

/**
 * Render selection process
 */
function renderSelectionProcess(selection) {
  if (!selection || selection.length === 0) {
    elements.selectionSection.classList.add("hidden");
    return;
  }

  const items = selection
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  elements.selectionList.innerHTML = items;
}

/**
 * Render important links
 */
function renderImportantLinks(links) {
  if (!links || links.length === 0) {
    elements.linksSection.classList.add("hidden");
    return;
  }

  const linkItems = links
    .map(
      (item) =>
        `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="link-item">
      <span class="link-label">${escapeHtml(item.label)}</span>
      <svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>`,
    )
    .join("");

  elements.linksGrid.innerHTML = linkItems;
}

/**
 * Render FAQs accordion
 */
function renderFAQs(faqs) {
  if (!faqs || faqs.length === 0) {
    elements.faqsSection.classList.add("hidden");
    return;
  }

  const faqItems = faqs
    .map(
      (faq, index) =>
        `<div class="faq-item" data-faq="${index}">
      <button class="faq-question" aria-expanded="false">
        <span>${escapeHtml(faq.question)}</span>
        <svg class="faq-icon" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="faq-answer">
        <p>${escapeHtml(faq.answer)}</p>
      </div>
    </div>`,
    )
    .join("");

  elements.faqsAccordion.innerHTML = faqItems;

  // Add click handlers for accordion
  elements.faqsAccordion.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains("open");

      // Close all others
      elements.faqsAccordion
        .querySelectorAll(".faq-item")
        .forEach((el) => el.classList.remove("open"));

      // Toggle current
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      } else {
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });
}

/**
 * Render job details
 */
function renderJobDetail(job) {
  // Update meta tags
  updateMetaTags(job);

  // Update breadcrumb
  elements.breadcrumbTitle.textContent =
    job.title.length > 40 ? job.title.substring(0, 40) + "..." : job.title;

  // Update header content
  elements.jobSource.textContent = job.source;
  elements.jobDate.textContent = formatDate(job.date);
  elements.jobDate.setAttribute("datetime", job.date);
  elements.jobUpdated.textContent = formatRelativeDate(job.date);
  elements.jobTitle.textContent = job.title;

  // Render overview section
  elements.jobOverview.textContent =
    job.overview ||
    job.description ||
    `This is an official notification for ${job.title} from ${job.source}. Visit the official website for complete details.`;

  // Render all sections
  renderImportantDates(job.importantDates);
  renderApplicationFee(job.applicationFee);
  renderAgeLimit(job.ageLimit);
  renderVacancyDetails(job.vacancyDetails);
  renderEligibility(job.eligibility);
  renderSelectionProcess(job.selectionProcess);
  renderHowToApply(job.howToApply);
  renderImportantLinks(job.importantLinks);
  renderAvailablePosts(job.posts);
  renderFAQs(job.faqs);

  // Update quick info
  elements.jobOrg.textContent = job.source;
  elements.jobPostedDate.textContent = formatDate(job.date);
  elements.jobOfficialLink.href = job.link;
  elements.jobOfficialLink.textContent = new URL(job.link).hostname;
  elements.applyBtn.href = job.link;

  // Hide skeleton, show content
  elements.jobSkeleton.classList.add("hidden");
  elements.jobContent.classList.remove("hidden");
}

/**
 * Create job card HTML for related jobs
 */
function createJobCard(job) {
  const formattedDate = jobs.formatJobDate(job.date);

  return `
        <a href="job.html?id=${job.id}" class="job-card job-card-link">
            <div class="job-card-header">
                <span class="job-source">${escapeHtml(job.source)}</span>
                <time class="job-date" datetime="${job.date}">${formattedDate}</time>
            </div>
            <h3 class="job-title">${escapeHtml(job.title)}</h3>
        </a>
    `;
}

/**
 * Render related jobs from same source
 */
function renderRelatedJobs(currentJob, allJobs) {
  const relatedJobs = allJobs
    .filter(
      (job) => job.source === currentJob.source && job.id !== currentJob.id,
    )
    .slice(0, 3);

  if (relatedJobs.length === 0) {
    return;
  }

  elements.relatedSource.textContent = currentJob.source;
  elements.relatedJobsGrid.innerHTML = relatedJobs
    .map((job) => createJobCard(job))
    .join("");
  elements.relatedJobs.classList.remove("hidden");
}

/**
 * Show error state
 */
function showError() {
  elements.jobSkeleton.classList.add("hidden");
  elements.jobContent.classList.add("hidden");
  elements.jobError.classList.remove("hidden");
  document.title = "Job Not Found | Job Alert";
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
  // Theme toggle
  elements.themeToggle.addEventListener("click", () => {
    theme.toggleTheme();
  });
}

/**
 * Initialize the page
 */
async function init() {
  // Initialize theme
  theme.init();

  // Set up event listeners
  initEventListeners();

  // Get job ID from URL
  const jobId = getJobIdFromUrl();

  if (!jobId) {
    showError();
    return;
  }

  try {
    // Fetch jobs data
    const allJobs = await jobs.fetchJobs();

    // Find the specific job
    const job = allJobs.find((j) => j.id === jobId);

    if (!job) {
      showError();
      return;
    }

    // Render job details
    renderJobDetail(job);

    // Render related jobs
    renderRelatedJobs(job, allJobs);
  } catch (error) {
    console.error("Failed to load job:", error);
    showError();
  }
}

// Start the application
init();

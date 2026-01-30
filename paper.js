/**
 * Individual Paper Page - Programmatic SEO
 */

import { useTheme } from "./hooks/theme.js";
import { useJobs } from "./hooks/jobs.js";
import { SEO } from "./hooks/pseo.js";
import { useI18n } from "./hooks/i18n.js";

const theme = useTheme();
const jobs = useJobs();
const i18n = useI18n();

// Exam metadata for SEO content generation
const EXAM_DATA = {
  "ssc-cgl": {
    name: "SSC CGL",
    fullName: "Staff Selection Commission Combined Graduate Level",
    org: "SSC",
    jobTypes: [
      "Income Tax Inspector",
      "ASO",
      "Central Excise Inspector",
      "Statistical Investigator",
    ],
    syllabus: {
      sections: [
        {
          subject: "Tier I: General Intelligence",
          topics: "Analogies, Symbolism, Number Series, Figural Pattern.",
        },
        {
          subject: "Tier I: Quantitative Aptitude",
          topics:
            "Computation of whole numbers, Decimals, Fractions, Profit & Loss.",
        },
      ],
    },
  },
  "ssc-chsl": {
    name: "SSC CHSL",
    fullName: "Staff Selection Commission Combined Higher Secondary Level",
    org: "SSC",
  },
  "ssc-mts": {
    name: "SSC MTS",
    fullName: "Staff Selection Commission Multi-Tasking Staff",
    org: "SSC",
  },
  "ibps-po": {
    name: "IBPS PO",
    fullName: "Institute of Banking Personnel Selection Probationary Officer",
    org: "IBPS",
  },
  "ibps-clerk": {
    name: "IBPS Clerk",
    fullName: "Institute of Banking Personnel Selection Clerk",
    org: "IBPS",
  },
  "rrb-ntpc": {
    name: "Railway NTPC",
    fullName: "Railway Recruitment Board Non-Technical Popular Categories",
    org: "Railway",
    jobTypes: [
      "Commercial Apprentice",
      "Goods Guard",
      "Junior Accounts Assistant",
      "Senior Clerk cum Typist",
    ],
    syllabus: {
      sections: [
        {
          subject: "CBT: Mathematics",
          topics: "Number System, BODMAS, Decimals, Fractions, LCM, HCF.",
        },
        {
          subject: "CBT: General Intelligence",
          topics: "Puzzles, Data Sufficiency, Syllogism.",
        },
      ],
    },
  },
  "rrb-group-d": {
    name: "Railway Group D",
    fullName: "Railway Recruitment Board Group D",
    org: "Railway",
  },
  "upsc-cse": {
    name: "UPSC CSE",
    fullName: "Union Public Service Commission Civil Services Examination",
    org: "UPSC",
  },
};

const SUBJECT_DATA = {
  "quantitative-aptitude": "Quantitative Aptitude",
  reasoning: "Reasoning Ability",
  english: "English Language",
  "general-awareness": "General Awareness",
  "general-studies": "General Studies",
};

// DOM Elements
const elements = {
  themeToggle: document.getElementById("themeToggle"),
  langToggle: document.getElementById("langToggle"),
  breadcrumbTitle: document.getElementById("breadcrumbTitle"),
  paperSkeleton: document.getElementById("paperSkeleton"),
  paperContent: document.getElementById("paperContent"),
  paperError: document.getElementById("paperError"),
  paperExam: document.getElementById("paperExam"),
  paperTitle: document.getElementById("paperTitle"),
  paperYear: document.getElementById("paperYear"),
  paperSubject: document.getElementById("paperSubject"),
  paperDescription: document.getElementById("paperDescription"),
  downloadSection: document.getElementById("downloadSection"),
  downloadBtn: document.getElementById("downloadBtn"),
  comingSoonSection: document.getElementById("comingSoonSection"),
  seoContent: document.getElementById("seoContent"),
  relatedJobsSection: document.getElementById("relatedJobsSection"),
  relatedJobsGrid: document.getElementById("relatedJobsGrid"),
  relatedPapersSection: document.getElementById("relatedPapersSection"),
  relatedPapersGrid: document.getElementById("relatedPapersGrid"),
  // Sidebar elements
  paperSidebar: document.getElementById("paperSidebar"),
  syllabusBox: document.getElementById("syllabusBox"),
  syllabusContent: document.getElementById("syllabusContent"),
  jobTypesBox: document.getElementById("jobTypesBox"),
  jobTypesList: document.getElementById("jobTypesList"),
  // Sidebar Resources
  resourcesBox: document.getElementById("resourcesBox"),
  resourcesContent: document.getElementById("resourcesContent"),
};

/**
 * Get URL parameters
 */
function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    exam: params.get("exam"),
    year: params.get("year"),
    subject: params.get("subject"),
  };
}

/**
 * Load papers
 */
async function loadPapers() {
  try {
    const response = await fetch("papers.json");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("No papers.json");
  }
  return [];
}

/**
 * Generate page title
 */
function generateTitle(exam, year, subject) {
  const examName = EXAM_DATA[exam]?.name || exam?.toUpperCase() || "";
  const subjectName = SUBJECT_DATA[subject] || "";

  let title = examName;
  if (year) title += ` ${year}`;
  if (subjectName) title += ` ${subjectName}`;
  title += " Previous Year Papers";

  return title;
}

/**
 * Generate SEO content
 */
function generateSEOContent(exam, year, subject) {
  const examData = EXAM_DATA[exam];
  const examName = examData?.name || exam?.toUpperCase() || "Government Exam";
  const fullName = examData?.fullName || examName;
  const subjectName = SUBJECT_DATA[subject] || "";

  let html = `
        <h2>About ${examName} Previous Year Papers</h2>
        <p>Practicing previous year question papers is one of the most effective ways to prepare for ${fullName}. These papers help you understand the exam pattern, question types, and difficulty level. By solving actual papers from past years, you can identify important topics and improve your time management skills.</p>
    `;

  if (year) {
    html += `<h3>${examName} ${year} Paper Analysis</h3>
        <p>The ${examName} ${year} examination followed the standard pattern with questions from all sections. Candidates who practiced previous year papers reported better performance due to familiarity with question styles.</p>`;
  }

  if (subjectName) {
    html += `<h3>${subjectName} Section</h3>
        <p>The ${subjectName} section in ${examName} tests candidates' proficiency in this area. Regular practice with previous year papers for this subject will help you master the frequently asked concepts and improve accuracy.</p>`;
  }

  html += `
        <h3>Preparation Tips</h3>
        <ul>
            <li>Start with understanding the exam pattern and syllabus</li>
            <li>Practice previous year papers under timed conditions</li>
            <li>Analyze your mistakes and work on weak areas</li>
            <li>Stay updated with the latest notifications on LatestJobs.space</li>
        </ul>
    `;

  return html;
}

/**
 * Update meta tags
 */
function updateMetaTags(title, exam, year, subject) {
  document.title = `${title} | LatestJobs.space`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      "content",
      `Download free ${title}. Practice with actual exam papers and boost your preparation for ${EXAM_DATA[exam]?.fullName || "government exams"}.`,
    );
  }

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    let url = `${window.location.origin}/paper.html?exam=${exam}`;
    if (year) url += `&year=${year}`;
    if (subject) url += `&subject=${subject}`;
    canonical.setAttribute("href", url);
  }
}

/**
 * Render related jobs
 */
async function renderRelatedJobs(org) {
  try {
    const allJobs = await jobs.fetchJobs();
    const related = allJobs.filter((job) => job.source === org).slice(0, 3);

    if (related.length === 0) {
      elements.relatedJobsSection.classList.add("hidden");
      return;
    }

    const html = related
      .map(
        (job) => `
            <a href="job.html?id=${job.id}" class="job-card job-card-link">
                <div class="job-card-header">
                    <span class="job-source">${job.source}</span>
                </div>
                <h3 class="job-title">${job.title}</h3>
            </a>
        `,
      )
      .join("");

    elements.relatedJobsGrid.innerHTML = html;
    elements.relatedJobsSection.classList.remove("hidden");
  } catch (e) {
    elements.relatedJobsSection.classList.add("hidden");
  }
}

/**
 * Render page
 */
async function renderPage() {
  const { exam, year, subject } = getParams();

  if (!exam && !subject) {
    showError();
    return;
  }

  const papers = await loadPapers();
  const title = generateTitle(exam, year, subject);

  updateMetaTags(title, exam, year, subject);

  elements.breadcrumbTitle.textContent =
    title.length > 30 ? title.substring(0, 30) + "..." : title;
  elements.paperExam.textContent =
    EXAM_DATA[exam]?.name || exam?.toUpperCase() || "";
  elements.paperTitle.textContent = title;
  elements.paperYear.textContent = year || "";
  elements.paperSubject.textContent = SUBJECT_DATA[subject] || "";

  // Find matching papers
  const matchingPapers = papers.filter((p) => {
    const paperExam = p.examSlug || p.exam;
    if (exam && paperExam !== exam) return false;
    return true;
  });

  if (matchingPapers.length === 0) {
    elements.comingSoonSection.classList.remove("hidden");
    return;
  }

  elements.comingSoonSection.classList.add("hidden");

  // Determine if we show details or list
  // Show details only if Year AND Subject are present (legacy link)
  // OR if the user explicitly clicked a single paper from the list (which we might handle via ID in future, but for now stick to year+subject)
  const isSinglePaper = year && subject;

  if (isSinglePaper) {
    // SINGLE PAPER VIEW
    document.getElementById("singlePaperView").classList.remove("hidden");
    document.getElementById("paperControls").classList.add("hidden");
    document.getElementById("papersListContainer").classList.add("hidden");

    // Filter strictly
    const paper = matchingPapers.find(
      (p) =>
        p.year === year && (p.subjectSlug === subject || p.subject === subject),
    );

    if (paper) {
      elements.paperYear.textContent = paper.year;
      elements.paperSubject.textContent =
        SUBJECT_DATA[paper.subject] || paper.subject;
      elements.paperDescription.textContent = paper.description;

      if (paper.metaTitle) document.title = paper.metaTitle;
      if (paper.metaDesc) {
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", paper.metaDesc);
      }

      if (paper.pdfUrl) {
        elements.downloadBtn.href = paper.pdfUrl;
        elements.downloadSection.classList.remove("hidden");
      } else {
        elements.downloadSection.classList.add("hidden");
      }
    }
  } else {
    // LISTING VIEW (Use Filters)
    document.getElementById("singlePaperView").classList.add("hidden");
    document.getElementById("paperControls").classList.remove("hidden");
    document.getElementById("papersListContainer").classList.remove("hidden");

    // Populate Filters
    const years = [...new Set(matchingPapers.map((p) => p.year))]
      .sort()
      .reverse();
    const subjects = [...new Set(matchingPapers.map((p) => p.subject))].sort();

    const yearSelect = document.getElementById("filterYear");
    const subjectSelect = document.getElementById("filterSubject");

    // Populate only if empty
    if (yearSelect.options.length === 1) {
      years.forEach((y) => yearSelect.add(new Option(y, y)));
    }
    if (subjectSelect.options.length === 1) {
      subjects.forEach((s) =>
        subjectSelect.add(new Option(SUBJECT_DATA[s] || s, s)),
      );
    }

    // Apply Local Filters
    const selectedYear = yearSelect.value;
    const selectedSubject = subjectSelect.value;

    const filtered = matchingPapers.filter((p) => {
      if (selectedYear && p.year !== selectedYear) return false;
      if (selectedSubject && p.subject !== selectedSubject) return false;
      return true;
    });

    document.getElementById("totalPapersCount").textContent =
      `${filtered.length} Papers Found`;

    // Group by Year
    const papersByYear = {};
    filtered.forEach((p) => {
      if (!papersByYear[p.year]) papersByYear[p.year] = [];
      papersByYear[p.year].push(p);
    });

    const container = document.getElementById("papersListContainer");
    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state"><p class="empty-text">No papers match your filter.</p></div>`;
    } else {
      container.innerHTML = Object.keys(papersByYear)
        .sort()
        .reverse()
        .map(
          (yr) => `
            <div class="year-group">
                <h2 class="year-heading">${yr} Papers</h2>
                <div class="papers-grid">
                    ${papersByYear[yr]
                      .map(
                        (p) => `
                        <div class="paper-card">
                            <div class="paper-card-header">
                                <span class="paper-tag">${SUBJECT_DATA[p.subject] || p.subject}</span>
                            </div>
                            <h3 class="paper-card-title">${p.description || p.subject + " Paper"}</h3>
                            <a href="${p.pdfUrl || "#"}" target="_blank" class="paper-btn">Download PDF →</a>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `,
        )
        .join("");
    }

    // Bind events if not already
    yearSelect.onchange = renderPage;
    subjectSelect.onchange = renderPage;
  }

  // SEO Content (Global)
  elements.seoContent.innerHTML = generateSEOContent(exam, year, subject);

  // Programmatic SEO: Update Meta & Schema
  SEO.updateMeta({
    title: `${title} | LatestJobs.space`,
    description: `Download free ${title}. Practice with actual exam papers from ${
      EXAM_DATA[exam]?.fullName || "government exams"
    }.`,
    url: window.location.href,
    image: "https://latestjobs.space/assets/og-default.png",
  });

  // Generate BreadcrumbSchema or similar if needed, or simple WebPage schema
  SEO.injectSchema({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: `Collection of previous year question papers for ${
      EXAM_DATA[exam]?.name || exam
    }`,
    provider: {
      "@type": "Organization",
      name: "LatestJobs.space",
    },
  });

  // Related jobs
  const org = EXAM_DATA[exam]?.org;
  if (org) {
    await renderRelatedJobs(org);
  } else {
    elements.relatedJobsSection.classList.add("hidden");
  }

  // Related papers
  elements.relatedPapersSection.classList.add("hidden");

  // Show content
  elements.paperSkeleton.classList.add("hidden");
  elements.paperContent.classList.remove("hidden");

  // Render Sidebar
  renderSidebar(exam, matchingPapers.length === 1 ? matchingPapers[0] : null);
  loadSidebarResources();
}

/**
 * Render Sidebar
 */
function renderSidebar(exam, paper = null) {
  const examData = EXAM_DATA[exam] || {};
  const data = {
    syllabus: paper?.syllabus || examData.syllabus,
    jobTypes: paper?.job_types || examData.jobTypes,
  };

  if ((!data.syllabus && !data.jobTypes) || !elements.paperSidebar) {
    if (elements.paperSidebar) elements.paperSidebar.classList.add("hidden");
    return;
  }

  elements.paperSidebar.classList.remove("hidden");

  // Job Types
  if (data.jobTypes && data.jobTypes.length > 0) {
    elements.jobTypesBox.classList.remove("hidden");
    elements.jobTypesList.innerHTML = data.jobTypes
      .map(
        (type) => `
      <li class="job-type-item">${escapeHtml(type)}</li>
    `,
      )
      .join("");
  } else {
    elements.jobTypesBox.classList.add("hidden");
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
 * Show error
 */
function showError() {
  elements.paperSkeleton.classList.add("hidden");
  elements.paperContent.classList.add("hidden");
  elements.paperError.classList.remove("hidden");
}

/**
 * Initialize
 */
function init() {
  theme.init();

  elements.themeToggle.addEventListener("click", () => {
    theme.toggleTheme();
  });

  // Language toggle
  elements.langToggle.addEventListener("click", () => {
    const nextLang = i18n.getLanguage() === "en" ? "hi" : "en";
    i18n.setLanguage(nextLang);
    elements.langToggle.querySelector(".lang-text").textContent =
      nextLang === "en" ? "HI" : "EN";
    renderPage(); // Re-render paper in new language
  });

  renderPage();
}

init();

/**
 * Load and render sidebar resources
 */
async function loadSidebarResources() {
  if (!elements.resourcesBox || !elements.resourcesContent) return;

  try {
    const response = await fetch("resources.json?t=" + Date.now());
    if (!response.ok) return;

    const resources = await response.json();
    if (resources && resources.length > 0) {
      elements.resourcesBox.classList.remove("hidden");
      elements.resourcesContent.innerHTML = resources
        .map(
          (res) => `
        <div class="sidebar-resource-item">
          <span class="icon">🔹</span>
          <a href="${res.link}" class="sidebar-resource-link">${escapeHtml(res.title)}</a>
        </div>
      `,
        )
        .join("");
    }
  } catch (e) {
    console.warn("Failed to load sidebar resources:", e);
  }
}

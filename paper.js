/**
 * Individual Paper Page - Programmatic SEO
 */

import { useTheme } from "./hooks/theme.js";
import { useJobs } from "./hooks/jobs.js";

const theme = useTheme();
const jobs = useJobs();

// Exam metadata for SEO content generation
const EXAM_DATA = {
  "ssc-cgl": {
    name: "SSC CGL",
    fullName: "Staff Selection Commission Combined Graduate Level",
    org: "SSC",
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
    if (exam && p.examSlug !== exam) return false;
    if (year && p.year !== year) return false;
    if (subject && p.subjectSlug !== subject) return false;
    return true;
  });

  if (matchingPapers.length > 0) {
    const paper = matchingPapers[0];
    elements.paperDescription.textContent =
      paper.description || `Download ${title} for your exam preparation.`;

    if (paper.pdfUrl) {
      elements.downloadBtn.href = paper.pdfUrl;
      elements.downloadSection.classList.remove("hidden");
      elements.comingSoonSection.classList.add("hidden");
    } else {
      elements.downloadSection.classList.add("hidden");
      elements.comingSoonSection.classList.remove("hidden");
    }
  } else {
    elements.paperDescription.textContent = `Download ${title} for your exam preparation. Practice with actual exam papers to boost your preparation.`;
    elements.downloadSection.classList.add("hidden");
    elements.comingSoonSection.classList.remove("hidden");
  }

  // SEO Content
  elements.seoContent.innerHTML = generateSEOContent(exam, year, subject);

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

  renderPage();
}

init();

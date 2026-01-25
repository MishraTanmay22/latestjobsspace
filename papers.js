/**
 * Papers Listing Page
 */

import { useTheme } from "./hooks/theme.js";
import { useI18n } from "./hooks/i18n.js";

const theme = useTheme();
const i18n = useI18n();

// Exam categories for programmatic SEO
const EXAM_CATEGORIES = [
  {
    slug: "ssc-cgl",
    name: "SSC CGL",
    fullName: "Staff Selection Commission - Combined Graduate Level",
  },
  {
    slug: "ssc-chsl",
    name: "SSC CHSL",
    fullName: "Staff Selection Commission - Combined Higher Secondary Level",
  },
  {
    slug: "ssc-mts",
    name: "SSC MTS",
    fullName: "Staff Selection Commission - Multi-Tasking Staff",
  },
  {
    slug: "ibps-po",
    name: "IBPS PO",
    fullName: "Institute of Banking Personnel Selection - Probationary Officer",
  },
  {
    slug: "ibps-clerk",
    name: "IBPS Clerk",
    fullName: "Institute of Banking Personnel Selection - Clerk",
  },
  {
    slug: "rrb-ntpc",
    name: "Railway NTPC",
    fullName: "Railway Recruitment Board - Non-Technical Popular Categories",
  },
  {
    slug: "rrb-group-d",
    name: "Railway Group D",
    fullName: "Railway Recruitment Board - Group D",
  },
  {
    slug: "upsc-cse",
    name: "UPSC CSE",
    fullName: "Union Public Service Commission - Civil Services Examination",
  },
];

// DOM Elements
const elements = {
  themeToggle: document.getElementById("themeToggle"),
  langToggle: document.getElementById("langToggle"),
  examGrid: document.getElementById("examGrid"),
  recentPapers: document.getElementById("recentPapers"),
  comingSoonNote: document.getElementById("comingSoonNote"),
};

/**
 * Load papers from JSON
 */
async function loadPapers() {
  try {
    const response = await fetch("papers.json");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("No papers.json found");
  }
  return [];
}

/**
 * Render exam categories grid
 */
function renderExamGrid() {
  const html = EXAM_CATEGORIES.map(
    (exam) => `
        <a href="paper.html?exam=${exam.slug}" class="exam-card">
            <h3 class="exam-card-title">${exam.name}</h3>
            <p class="exam-card-desc">${exam.fullName}</p>
            <span class="exam-card-link">View Papers →</span>
        </a>
    `,
  ).join("");

  elements.examGrid.innerHTML = html;
}

/**
 * Render recent papers
 */
async function renderRecentPapers() {
  const papers = await loadPapers();

  if (papers.length === 0) {
    elements.recentPapers.innerHTML =
      '<p class="no-papers">Papers are being added. Check back soon!</p>';
    return;
  }

  const recent = papers.slice(0, 6);

  const html = recent
    .map(
      (paper) => `
        <a href="paper.html?exam=${paper.examSlug}&year=${paper.year}&subject=${paper.subjectSlug}" class="paper-card">
            <div class="paper-card-header">
                <span class="paper-card-exam">${paper.exam}</span>
                <span class="paper-card-year">${paper.year}</span>
            </div>
            <h3 class="paper-card-title">${paper.subject}</h3>
            <p class="paper-card-desc">${paper.description || ""}</p>
        </a>
    `,
    )
    .join("");

  elements.recentPapers.innerHTML = html;
  elements.comingSoonNote.classList.add("hidden");
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
      renderExamGrid();
      renderRecentPapers();
    });
  }

  renderExamGrid();
  renderRecentPapers();
}

init();

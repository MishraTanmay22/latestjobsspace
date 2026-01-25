/**
 * Localization Hook
 * Manages language state and translations
 */

const translations = {
  en: {
    hero_title: "Find Your Dream Government Job",
    hero_subtitle:
      "Stay updated with the latest notifications from SSC, IBPS, Railway, and more",
    latest_jobs: "Latest Jobs",
    admit_cards: "Admit Cards",
    results: "Results",
    search_placeholder: "Search jobs by title...",
    source_label: "SOURCE",
    date_label: "DATE",
    clear_filters: "Clear",
    view_all: "View All",
    syllabus_title: "Syllabus Overview",
    job_types_title: "Department/Post Types",
    quick_actions: "Quick Actions",
    share_job: "Share this Job",
    official_notification: "Official Notification",
    back_to_jobs: "Back to Jobs",
    posted_on: "Posted On",
    organization: "Organization",
    official_website: "Official Website",
    apply_now: "Apply Now",
  },
  hi: {
    hero_title: "अपने सपनों की सरकारी नौकरी पाएं",
    hero_subtitle:
      "SSC, IBPS, रेलवे और अन्य से नवीनतम सूचनाओं के साथ अपडेट रहें",
    latest_jobs: "नवीनतम नौकरियां",
    admit_cards: "प्रवेश पत्र",
    results: "परिणाम",
    search_placeholder: "शीर्षक द्वारा नौकरियां खोजें...",
    source_label: "स्रोत",
    date_label: "दिनांक",
    clear_filters: "साफ़ करें",
    view_all: "सभी देखें",
    syllabus_title: "पाठ्यक्रम अवलोकन",
    job_types_title: "विभाग/पद के प्रकार",
    quick_actions: "त्वरित कार्रवाई",
    share_job: "इस नौकरी को साझा करें",
    official_notification: "आधिकारिक अधिसूचना",
    back_to_jobs: "नौकरियों पर वापस जाएं",
    posted_on: "पोस्ट किया गया",
    organization: "संगठन",
    official_website: "आधिकारिक वेबसाइट",
    apply_now: "अभी आवेदन करें",
  },
};

export const useI18n = () => {
  const STORAGE_KEY = "job-alert-lang";
  let currentLang = localStorage.getItem(STORAGE_KEY) || "en";

  const setLanguage = (lang) => {
    if (translations[lang]) {
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      updateUI();
      window.dispatchEvent(
        new CustomEvent("languageChanged", { detail: lang }),
      );
    }
  };

  const t = (key) => {
    return translations[currentLang][key] || key;
  };

  const updateUI = () => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (el.tagName === "INPUT" && el.placeholder) {
        el.placeholder = t(key);
      } else {
        el.textContent = t(key);
      }
    });
  };

  const init = () => {
    document.documentElement.lang = currentLang;
    updateUI();
  };

  return {
    init,
    setLanguage,
    t,
    getLanguage: () => currentLang,
    isHindi: () => currentLang === "hi",
  };
};

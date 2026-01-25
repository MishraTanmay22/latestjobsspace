/**
 * Jobs Hook - Manages fetching and storing job data
 * Returns state and methods for job data management
 */

export function useJobs() {
  // State
  let jobs = [];
  let isLoading = false;
  let error = null;
  const listeners = new Set();

  /**
   * Notify all subscribers of state change
   */
  function notifyListeners() {
    const state = getState();
    listeners.forEach((callback) => callback(state));
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      jobs: [...jobs],
      isLoading,
      error,
    };
  }

  /**
   * Parse and validate job data
   */
  function parseJobData(data) {
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format: expected an array");
    }

    return data.map((job, index) => ({
      ...job, // Preserve all original fields
      id: job.id || `job-${index}-${Date.now()}`,
      title: job.title || "Untitled Position",
      source: job.source || "Unknown",
      type: job.type || "job",
      status: job.status || "live",
      exam_year: job.exam_year || "2026",
      date: job.date || job.createdAt || null, // Fallback to createdAt
      link: job.link || job.applyLink || "#", // Fallback to applyLink
    }));
  }

  /**
   * Fetch jobs from JSON file
   */
  async function fetchJobs(url = "./jobs.json") {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      // Add cache busting
      const fetchUrl = `${url}?t=${Date.now()}`;
      const response = await fetch(fetchUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch jobs: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      jobs = parseJobData(data).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      isLoading = false;
      notifyListeners();

      return jobs;
    } catch (e) {
      error = e.message;
      isLoading = false;
      notifyListeners();
      throw e;
    }
  }

  /**
   * Get all unique sources from jobs
   */
  function getSources() {
    const sources = new Set(jobs.map((job) => job.source));
    return Array.from(sources).sort();
  }

  /**
   * Get job by ID
   */
  function getJobById(id) {
    return jobs.find((job) => job.id === id) || null;
  }

  /**
   * Get total job count
   */
  function getCount() {
    return jobs.length;
  }

  /**
   * Subscribe to state changes
   */
  function subscribe(callback) {
    listeners.add(callback);
    // Return unsubscribe function
    return () => listeners.delete(callback);
  }

  /**
   * Format date for display (relative or absolute)
   */
  function formatJobDate(dateString) {
    if (!dateString) return "No date";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return "Today";
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch {
      return dateString;
    }
  }

  return {
    // State getters
    getState,
    getSources,
    getJobById,
    getCount,
    formatJobDate,

    // Methods
    fetchJobs,
    subscribe,
  };
}

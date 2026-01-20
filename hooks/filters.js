/**
 * Filters Hook - Manages filtering logic for jobs
 * Returns state and methods for filter management
 */

export function useFilters() {
  // State
  let filters = {
    search: "",
    source: "",
    date: "",
  };
  const listeners = new Set();

  /**
   * Notify all subscribers of state change
   */
  function notifyListeners() {
    listeners.forEach((callback) => callback({ ...filters }));
  }

  /**
   * Get current filter state
   */
  function getFilters() {
    return { ...filters };
  }

  /**
   * Set search filter
   */
  function setSearch(value) {
    filters.search = value.trim().toLowerCase();
    notifyListeners();
  }

  /**
   * Set source filter
   */
  function setSource(value) {
    filters.source = value;
    notifyListeners();
  }

  /**
   * Set date filter
   */
  function setDate(value) {
    filters.date = value;
    notifyListeners();
  }

  /**
   * Set multiple filters at once
   */
  function setFilters(newFilters) {
    filters = {
      ...filters,
      ...newFilters,
      search: (newFilters.search || filters.search || "").trim().toLowerCase(),
    };
    notifyListeners();
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    filters = {
      search: "",
      source: "",
      date: "",
    };
    notifyListeners();
  }

  /**
   * Check if any filters are active
   */
  function hasActiveFilters() {
    return (
      filters.search !== "" || filters.source !== "" || filters.date !== ""
    );
  }

  /**
   * Check if job matches date filter
   */
  function matchesDateFilter(jobDate) {
    if (!filters.date || !jobDate) return true;

    try {
      const date = new Date(jobDate);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.date) {
        case "today":
          return diffDays === 0;
        case "week":
          return diffDays <= 7;
        default:
          return true;
      }
    } catch {
      return true;
    }
  }

  /**
   * Check if job matches source filter
   */
  function matchesSourceFilter(jobSource) {
    if (!filters.source) return true;
    return jobSource.toLowerCase() === filters.source.toLowerCase();
  }

  /**
   * Check if job matches search filter
   */
  function matchesSearchFilter(jobTitle) {
    if (!filters.search) return true;
    return jobTitle.toLowerCase().includes(filters.search);
  }

  /**
   * Filter a list of jobs
   */
  function filterJobs(jobs) {
    return jobs.filter((job) => {
      const matchesSearch = matchesSearchFilter(job.title);
      const matchesSource = matchesSourceFilter(job.source);
      const matchesDate = matchesDateFilter(job.date);

      return matchesSearch && matchesSource && matchesDate;
    });
  }

  /**
   * Subscribe to filter changes
   */
  function subscribe(callback) {
    listeners.add(callback);
    // Return unsubscribe function
    return () => listeners.delete(callback);
  }

  /**
   * Add a custom filter function (for extensibility)
   */
  function createCustomFilter(filterFn) {
    return (jobs) => jobs.filter(filterFn);
  }

  /**
   * Compose multiple filter functions
   */
  function composeFilters(...filterFns) {
    return (jobs) => filterFns.reduce((result, fn) => fn(result), jobs);
  }

  return {
    // State getters
    getFilters,
    hasActiveFilters,

    // Methods
    setSearch,
    setSource,
    setDate,
    setFilters,
    clearFilters,
    filterJobs,
    subscribe,

    // Utility methods for extensibility
    createCustomFilter,
    composeFilters,

    // Individual matchers (for custom use)
    matchesDateFilter,
    matchesSourceFilter,
    matchesSearchFilter,
  };
}

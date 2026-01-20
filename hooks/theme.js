/**
 * Theme Hook - Manages light/dark mode
 * Returns state and methods for theme management
 */

export function useTheme() {
  const STORAGE_KEY = "job-alert-theme";
  const THEME_LIGHT = "light";
  const THEME_DARK = "dark";

  // State
  let currentTheme = THEME_LIGHT;
  const listeners = new Set();

  /**
   * Get system preference for color scheme
   */
  function getSystemPreference() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return THEME_DARK;
    }
    return THEME_LIGHT;
  }

  /**
   * Get stored theme preference
   */
  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Unable to access localStorage:", e);
      return null;
    }
  }

  /**
   * Store theme preference
   */
  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.warn("Unable to store theme preference:", e);
    }
  }

  /**
   * Apply theme to document
   */
  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === THEME_DARK ? "#0f172a" : "#ffffff",
      );
    }

    // Notify all listeners
    listeners.forEach((callback) => callback(theme));
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    applyTheme(newTheme);
    storeTheme(newTheme);
    return newTheme;
  }

  /**
   * Set a specific theme
   */
  function setTheme(theme) {
    if (theme !== THEME_LIGHT && theme !== THEME_DARK) {
      console.warn("Invalid theme:", theme);
      return;
    }
    applyTheme(theme);
    storeTheme(theme);
  }

  /**
   * Subscribe to theme changes
   */
  function subscribe(callback) {
    listeners.add(callback);
    // Return unsubscribe function
    return () => listeners.delete(callback);
  }

  /**
   * Initialize theme on page load
   */
  function init() {
    // Priority: stored preference > system preference > default (light)
    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme || getSystemPreference();
    applyTheme(initialTheme);

    // Listen for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", (e) => {
        // Only auto-switch if user hasn't set a preference
        if (!getStoredTheme()) {
          applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
      });
    }
  }

  /**
   * Get current theme
   */
  function getTheme() {
    return currentTheme;
  }

  /**
   * Check if dark mode is active
   */
  function isDark() {
    return currentTheme === THEME_DARK;
  }

  return {
    // State getters
    getTheme,
    isDark,

    // Methods
    init,
    toggleTheme,
    setTheme,
    subscribe,

    // Constants
    THEME_LIGHT,
    THEME_DARK,
  };
}

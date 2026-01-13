import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const UIContext = createContext(null);

const THEME_STORAGE_KEY = 'uyirgene-theme-mode';

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme mode state - default to dark, check localStorage
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved || 'dark';
    }
    return 'dark';
  });

  // Persist theme mode to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  // Theme controls
  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setDarkMode = useCallback(() => setThemeMode('dark'), []);
  const setLightMode = useCallback(() => setThemeMode('light'), []);

  // Sidebar controls
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // Mobile menu controls
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((prev) => !prev), []);

  const value = {
    // Theme
    themeMode,
    toggleTheme,
    setDarkMode,
    setLightMode,
    isDarkMode: themeMode === 'dark',
    // Sidebar
    sidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    // Mobile menu
    mobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

export default UIContext;

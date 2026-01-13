/**
 * PWA Utilities
 * Handles service worker registration and PWA-related functionality
 */

/**
 * Check if the app is running as an installed PWA
 */
export const isPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
};

/**
 * Check if the browser supports service workers
 */
export const supportsServiceWorker = () => {
  return 'serviceWorker' in navigator;
};

/**
 * Check if the app can be installed
 */
let deferredPrompt = null;

export const setupInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
};

/**
 * Show the install prompt if available
 */
export const showInstallPrompt = async () => {
  if (!deferredPrompt) {
    return { outcome: 'unavailable' };
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return { outcome };
};

/**
 * Check if install prompt is available
 */
export const canInstall = () => {
  return deferredPrompt !== null;
};

/**
 * Register for push notifications
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return { granted: false, reason: 'not-supported' };
  }

  if (Notification.permission === 'granted') {
    return { granted: true };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, reason: 'denied' };
  }

  const permission = await Notification.requestPermission();
  return { granted: permission === 'granted', permission };
};

/**
 * Show a notification
 */
export const showNotification = (title, options = {}) => {
  if (Notification.permission !== 'granted') {
    return null;
  }

  return new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    ...options,
  });
};

/**
 * Check online status
 */
export const isOnline = () => navigator.onLine;

/**
 * Add online/offline event listeners
 */
export const addNetworkListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

/**
 * Cache data locally
 */
export const cacheData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    return true;
  } catch (e) {
    console.error('Failed to cache data:', e);
    return false;
  }
};

/**
 * Get cached data
 */
export const getCachedData = (key, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Failed to get cached data:', e);
    return null;
  }
};

/**
 * Clear cached data
 */
export const clearCache = (key) => {
  if (key) {
    localStorage.removeItem(key);
  } else {
    // Clear all PWA-related cache
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith('pwa_') || k.startsWith('cache_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
};

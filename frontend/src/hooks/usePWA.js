import { useState, useEffect, useCallback } from 'react';
import {
  isPWA,
  canInstall,
  showInstallPrompt,
  setupInstallPrompt,
  addNetworkListeners,
  isOnline,
} from '../utils/pwaUtils';

/**
 * Hook for PWA functionality
 */
export function usePWA() {
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(isPWA());
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    // Setup install prompt listener
    setupInstallPrompt();

    // Check if installable
    const checkInstallable = () => {
      setInstallable(canInstall());
    };

    window.addEventListener('beforeinstallprompt', () => {
      setInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setInstallable(false);
    });

    // Setup network listeners
    const cleanup = addNetworkListeners(
      () => setOnline(true),
      () => setOnline(false)
    );

    return cleanup;
  }, []);

  const install = useCallback(async () => {
    const result = await showInstallPrompt();
    if (result.outcome === 'accepted') {
      setInstalled(true);
      setInstallable(false);
    }
    return result;
  }, []);

  return {
    installable,
    installed,
    online,
    install,
    isPWA: installed,
  };
}

export default usePWA;

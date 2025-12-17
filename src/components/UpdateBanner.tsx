import { useEffect, useState } from 'react';
import {
  initSWUpdateListener,
  acceptSWUpdate,
  clearPendingRegistration,
} from '../utils/swUpdateListener';

/**
 * Update Banner
 * Shows a non-intrusive banner when a new app version is available
 */
export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Initialize SW update listener
    initSWUpdateListener();

    // Listen for update ready events
    const handleSWUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('swupdate', handleSWUpdate);

    return () => {
      window.removeEventListener('swupdate', handleSWUpdate);
    };
  }, []);

  const handleUpdate = () => {
    acceptSWUpdate();
  };

  const handleDismiss = () => {
    clearPendingRegistration();
    setUpdateAvailable(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-action-primary text-white shadow-lg animate-slide-down">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <p className="text-sm font-medium">New version available</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-bg-card text-action-primary font-semibold text-sm rounded-lg hover:bg-bg-primary transition cursor-pointer whitespace-nowrap"
          >
            Update
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 hover:bg-white/15 transition cursor-pointer"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

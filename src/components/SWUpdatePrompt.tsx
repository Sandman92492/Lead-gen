import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
  initSWUpdateListener,
  acceptSWUpdate,
  clearPendingRegistration,
} from '../utils/swUpdateListener';

/**
 * Service Worker Update Prompt
 * Shows a toast when a new version is available
 */
export function SWUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Initialize SW update listener
    initSWUpdateListener();

    // Listen for update ready events
    const handleSWUpdate = () => {
      setUpdateAvailable(true);
      showToast(
        'New version available. Click to update.',
        'info',
        5000,
        true
      );
    };

    window.addEventListener('swupdate', handleSWUpdate);

    return () => {
      window.removeEventListener('swupdate', handleSWUpdate);
    };
  }, [showToast]);

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
    <div className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white rounded-lg shadow-lg p-4 max-w-sm">
      <p className="text-sm font-medium mb-3">New version available</p>
      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-white text-blue-500 px-3 py-2 rounded font-medium text-sm hover:bg-gray-100 transition"
        >
          Update Now
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded font-medium text-sm hover:bg-blue-700 transition"
        >
          Later
        </button>
      </div>
    </div>
  );
}

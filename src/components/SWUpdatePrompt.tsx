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
    console.log('SWUpdatePrompt: Initializing update listener');
    
    // Initialize SW update listener
    initSWUpdateListener();

    // Listen for update ready events
    const handleSWUpdate = () => {
      console.log('SWUpdatePrompt: swupdate event fired');
      setUpdateAvailable(true);
      showToast(
        'New version available. Click to update.',
        'info',
        5000
      );
    };

    window.addEventListener('swupdate', handleSWUpdate);

    return () => {
      window.removeEventListener('swupdate', handleSWUpdate);
    };
  }, [showToast]);

  const handleUpdate = () => {
    console.log('Update button clicked');
    acceptSWUpdate();
  };

  const handleDismiss = () => {
    console.log('Dismiss button clicked');
    clearPendingRegistration();
    setUpdateAvailable(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={handleDismiss} />
      
      {/* Modal */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] bg-white rounded-lg shadow-2xl p-6 max-w-sm">
        <p className="text-lg font-bold text-gray-900 mb-2">Update Available</p>
        <p className="text-sm text-gray-600 mb-4">A new version is ready to use.</p>
        <div className="flex gap-3">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 transition cursor-pointer"
          >
            Update Now
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300 transition cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
    </>
  );
}

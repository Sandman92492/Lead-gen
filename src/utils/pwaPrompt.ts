// PWA install prompt management
let deferredPrompt: any = null;
let promptShown = false;
let availabilityListeners: (() => void)[] = [];

// Notify all listeners when availability changes
const notifyListeners = () => {
  availabilityListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      // Silent error handling
    }
  });
};

// Ensure handlers are set up even in strict mode
function setupPWAHandlers() {
  const handleBeforeInstallPrompt = (e: any) => {
    // Don't prevent default - let browser show native popup automatically
    // Just capture for programmatic use if needed
    deferredPrompt = e;
    promptShown = false; // Reset when new prompt is available
    notifyListeners(); // Notify components that prompt is now available
  };

  const handleAppInstalled = () => {
    deferredPrompt = null;
    promptShown = false;
  };

  // Use capture phase to ensure we catch the event early
  if (typeof window !== 'undefined' && 'addEventListener' in window) {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt, true);
    window.addEventListener('appinstalled', handleAppInstalled, true);
  }
}

// Set up immediately on module load
setupPWAHandlers();



export const getPWAPrompt = () => deferredPrompt;

export const showPWAPrompt = async () => {
  if (deferredPrompt && !promptShown) {
    promptShown = true;
    try {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      promptShown = false; // Reset flag after user interaction
      notifyListeners(); // Notify when state changes
    } catch (error) {
      promptShown = false;
      notifyListeners(); // Notify when state changes
    }
  }
};

export const isPWAPromptAvailable = () => {
  const available = !!deferredPrompt && !promptShown;
  return available;
};

// Subscribe to prompt availability changes
export const onPromptAvailabilityChange = (callback: () => void) => {
  availabilityListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    availabilityListeners = availabilityListeners.filter(listener => listener !== callback);
  };
};

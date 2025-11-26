// PWA install prompt management
let deferredPrompt: any = null;
let promptShown = false;
let availabilityListeners: (() => void)[] = [];

console.log('[PWA] pwaPrompt.ts module loading...');

// Notify all listeners when availability changes
const notifyListeners = () => {
  availabilityListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('[PWA] Error in availability listener:', error);
    }
  });
};

// Ensure handlers are set up even in strict mode
function setupPWAHandlers() {
  console.log('[PWA] Setting up PWA handlers');
  
  const handleBeforeInstallPrompt = (e: any) => {
    console.log('[PWA] beforeinstallprompt event fired!');
    // Don't prevent default - let browser show native popup automatically
    // Just capture for programmatic use if needed
    deferredPrompt = e;
    promptShown = false; // Reset when new prompt is available
    console.log('[PWA] Install prompt captured - allowing browser native UI to show');
    notifyListeners(); // Notify components that prompt is now available
  };

  const handleAppInstalled = () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
    promptShown = false;
  };

  // Use capture phase to ensure we catch the event early
  if (typeof window !== 'undefined' && 'addEventListener' in window) {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt, true);
    window.addEventListener('appinstalled', handleAppInstalled, true);
    console.log('[PWA] Event listeners registered');
  }
}

// Set up immediately on module load
setupPWAHandlers();

// Debug state
if (typeof window !== 'undefined') {
  // Check browser support
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  console.log('[PWA] Browser detection:', { isSafari, isChrome, isAndroid, userAgent: navigator.userAgent });
  
  if (isSafari) {
    console.log('[PWA] Running on Safari - beforeinstallprompt not supported. Use native "Add to Home Screen" from Share menu');
  }
  
  (window as any).debugPWA = {
    getDeferredPrompt: () => deferredPrompt,
    getPromptShown: () => promptShown,
    isAvailable: () => !!deferredPrompt && !promptShown,
    reset: () => { deferredPrompt = null; promptShown = false; },
    getBrowserInfo: () => ({ isSafari, isChrome, isAndroid, userAgent: navigator.userAgent }),
    checkManifest: async () => {
      try {
        const response = await fetch('/manifest.json');
        const manifest = await response.json();
        console.log('[PWA] Manifest loaded:', manifest);
        return manifest;
      } catch (error) {
        console.error('[PWA] Failed to load manifest:', error);
      }
    },
  };
}

console.log('[PWA] pwaPrompt.ts loaded and initialized');

export const getPWAPrompt = () => deferredPrompt;

export const showPWAPrompt = async () => {
  console.log('[PWA] showPWAPrompt called', { deferredPrompt: !!deferredPrompt, promptShown });
  if (deferredPrompt && !promptShown) {
    promptShown = true;
    try {
      console.log('[PWA] Calling deferredPrompt.prompt()');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response: ${outcome}`);
      deferredPrompt = null;
      promptShown = false; // Reset flag after user interaction
      notifyListeners(); // Notify when state changes
    } catch (error) {
      console.error('[PWA] Error showing PWA prompt:', error);
      promptShown = false;
      notifyListeners(); // Notify when state changes
    }
  } else {
    console.log('[PWA] Cannot show prompt:', { deferredPrompt: !!deferredPrompt, promptShown });
  }
};

export const isPWAPromptAvailable = () => {
  const available = !!deferredPrompt && !promptShown;
  console.log('[PWA] isPWAPromptAvailable called', { deferredPrompt: !!deferredPrompt, promptShown, available });
  return available;
};

// Subscribe to prompt availability changes
export const onPromptAvailabilityChange = (callback: () => void) => {
  availabilityListeners.push(callback);
  console.log('[PWA] Listener registered, total listeners:', availabilityListeners.length);
  
  // Return unsubscribe function
  return () => {
    availabilityListeners = availabilityListeners.filter(listener => listener !== callback);
    console.log('[PWA] Listener unregistered, remaining listeners:', availabilityListeners.length);
  };
};

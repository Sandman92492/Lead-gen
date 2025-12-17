import React, { useState, useEffect } from 'react';
import Button from './Button';
import CookiePolicy from './CookiePolicy';

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem('cookie-consent');
    if (!hasConsent) {
      // Show banner after 1 second
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      preferences: true,
      analytics: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleRejectAnalytics = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      preferences: true,
      analytics: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-[var(--bottom-ui-offset)] md:bottom-0 left-0 right-0 bg-bg-card border-t border-border-subtle p-4 z-30 shadow-lg rounded-t-2xl md:rounded-none">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-action-primary mb-2">
                🍪 We Use Cookies
              </p>
              <p className="text-xs text-text-secondary mb-3">
                We use essential cookies to keep you signed in, preference cookies to remember your settings,
                and analytics cookies to improve the app. See our{' '}
                <button
                  onClick={() => setShowCookiePolicy(true)}
                  className="text-accent-primary underline hover:text-action-primary"
                >
                  Cookie Policy
                </button>
                {' '}for details.
              </p>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                onClick={handleRejectAnalytics}
                className="text-xs whitespace-nowrap"
              >
                Reject Analytics
              </Button>
              <Button
                variant="primary"
                onClick={handleAccept}
                className="text-xs whitespace-nowrap"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showCookiePolicy && <CookiePolicy onClose={() => setShowCookiePolicy(false)} />}
    </>
  );
};

export default CookieConsentBanner;

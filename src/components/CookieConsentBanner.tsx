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
      <div className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border-subtle p-4 z-[60] safe-area-bottom">
        <div className="max-w-md mx-auto">
          <p className="text-sm font-semibold text-text-primary mb-1">
            We use cookies
          </p>
          <p className="text-xs text-text-secondary mb-4">
            Essential cookies keep you signed in. Analytics cookies help us improve.{' '}
            <button
              onClick={() => setShowCookiePolicy(true)}
              className="text-primary underline"
            >
              Learn more
            </button>
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRejectAnalytics}
              className="flex-1"
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAccept}
              className="flex-1"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>

      {showCookiePolicy && <CookiePolicy onClose={() => setShowCookiePolicy(false)} />}
    </>
  );
};

export default CookieConsentBanner;

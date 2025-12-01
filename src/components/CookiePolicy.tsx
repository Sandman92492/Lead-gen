import React from 'react';
import Button from './Button';

interface CookiePolicyProps {
  onClose: () => void;
}

const CookiePolicy: React.FC<CookiePolicyProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-bg-card rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full relative border border-border-subtle my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-display font-black text-action-primary mb-4">
            Cookie Policy
          </h1>
          <p className="text-text-secondary text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6 text-text-primary overflow-y-auto max-h-[60vh]">
          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit our website or app.
              They help us remember your preferences and improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">2. Types of Cookies We Use</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1">Essential Cookies (Required)</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Firebase Auth Session:</strong> Keeps you signed in</li>
                  <li><strong>CSRF Protection:</strong> Prevents unauthorized actions</li>
                  <li>Duration: Until browser closed (session)</li>
                  <li>Cannot be disabled without breaking the app</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Preference Cookies (Optional)</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Theme Preference:</strong> Remembers light/dark mode</li>
                  <li>Duration: 1 year</li>
                  <li>Can be deleted via browser settings</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Analytics Cookies (Optional)</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Firebase Analytics:</strong> Tracks app usage and crashes</li>
                  <li>Duration: 30 days</li>
                  <li>We do NOT use Google Analytics</li>
                  <li>Can be disabled via our cookie consent tool</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">3. Third-Party Cookies</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Firebase (Google):</strong> Auth & analytics - Privacy: https://firebase.google.com/support/privacy</li>
              <li><strong>Yoco (Payments):</strong> Payment processing - Privacy: https://yoco.com/privacy</li>
              <li>All third parties are contractually obligated to protect your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">4. Your Cookie Rights</h2>
            <p className="mb-3">Under POPIA, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Accept or reject non-essential cookies</li>
              <li>Delete cookies via browser settings</li>
              <li>Request a list of cookies we use</li>
              <li>Opt-out of analytics tracking</li>
            </ul>
            <p className="mt-3 text-sm text-text-secondary">
              Note: Disabling essential cookies may break app functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">5. How to Control Cookies</h2>
            <p className="mb-2"><strong>In your browser:</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-sm mb-4">
              <li>Chrome: Settings → Privacy and security → Clear browsing data</li>
              <li>Firefox: Preferences → Privacy → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Manage Website Data</li>
              <li>Edge: Settings → Privacy → Choose what to clear</li>
            </ul>
            <p><strong>Opt-out links:</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Firebase Analytics: https://tools.google.com/dlpage/gaoptout</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">6. POPIA Compliance</h2>
            <p>
              We comply with POPIA Section 12 (notification) by disclosing cookies in this policy
              and obtaining your consent via our banner on first visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">7. Questions?</h2>
            <p>
              Contact us at:<br />
              <strong>Email:</strong> portalfredholidaypass@gmail.com <br />
              <strong>WhatsApp:</strong> 065 806 2198
            </p>
          </section>
        </div>

        <div className="mt-6 border-t border-border-subtle pt-6">
          <Button type="button" variant="primary" className="w-full" onClick={onClose}>
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;

import React from 'react';
import Button from './Button';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
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
          <h1 className="text-3xl font-display font-black text-accent-primary mb-4">
            Privacy Policy
          </h1>
          <p className="text-text-secondary text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6 text-text-primary overflow-y-auto max-h-[60vh]">
          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">1. Introduction</h2>
            <p>
              Port Alfred Holiday Pass ("we", "us", "our") operates the Holiday Pass application.
              This Privacy Policy explains our practices regarding the collection, use, and protection of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">2. Information We Collect</h2>
            <div className="space-y-2">
              <p className="font-semibold">We collect information you provide directly:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name and email address (during account creation)</li>
                <li>Password (securely stored)</li>
                <li>Payment information (processed through Yoco)</li>
                <li>Pass details and redemption information</li>
              </ul>
              <p className="font-semibold mt-4">Automatically collected information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Device information (IP address, browser type, OS)</li>
                <li>Usage data (pages visited, interactions with the app)</li>
                <li>Firebase authentication logs</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create and manage your account</li>
              <li>Process purchases and payments</li>
              <li>Track and manage pass redemptions</li>
              <li>Communicate updates and support</li>
              <li>Improve our service and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">4. Data Protection</h2>
            <p>
              Your personal information is stored securely using Firebase and Firestore. We use industry-standard
              encryption and security measures to protect your data from unauthorized access, alteration, and disclosure.
              Payment information is processed securely through Yoco and is not stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">5. Data Sharing</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share information with:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Service providers (Firebase, Yoco) who assist in operations</li>
              <li>Legal authorities if required by law</li>
              <li>Business partners for redemption purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">6. POPIA Compliance (South African Users)</h2>
            <p>
              If you are a South African resident, your data is protected under the Protection of Personal Information Act (POPIA).
              We collect and process your personal information with your explicit consent. You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Withdraw your consent at any time</li>
              <li>Lodge a complaint with the Information Regulator</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, remember preferences, and analyze usage.
              You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">8. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time by contacting us.
              We will respond to requests within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">9. Data Breach Notification (POPIA Section 22)</h2>
            <p>
              If we discover a data security breach that compromises your personal information, we will:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Notify the Information Regulator within 30 days of discovery</li>
              <li>Notify you by email at your registered address within 30 days</li>
              <li>Provide details of the breach and steps we've taken to remedy it</li>
              <li>Advise you of preventive measures you can take (e.g., changing your password)</li>
            </ul>
            <p className="mt-3 text-sm text-text-secondary">
              See our Breach Response Plan (available on request) for detailed procedures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes by email or
              through a prominent notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">11. Contact Us</h2>
            <p>
              For privacy concerns or requests, contact us at: <br />
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

export default PrivacyPolicy;

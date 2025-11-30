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
              This Privacy Policy governs the collection and use of personal data by Matthew Santillan t/a Holiday Pass ("we", "us", "our"). We operate the Holiday Pass digital application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">2. Information We Collect</h2>
            <div className="space-y-2">
              <p className="font-semibold">Information you provide:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name, email address, and payment details (processed securely via our payment gateway)</li>
              </ul>
              <p className="font-semibold mt-4">Usage Information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Device IP address, browser type, and interaction logs with the app (e.g., which deals you view)</li>
              </ul>
              <p className="font-semibold mt-4">Location Data:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>If you use the "Directions" feature, we may process location data to navigate you to vendors, though this is not stored permanently on our servers</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your data to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create your digital pass and verify ownership</li>
              <li>Process payments and issue receipts</li>
              <li>Track deal redemptions (to prevent abuse)</li>
              <li>Communicate critical updates (e.g., app outages or new deals)</li>
              <li>Comply with South African legal obligations (tax and consumer laws)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">4. Data Protection & Payment Security</h2>
            <p className="mb-3">
              Your personal data is stored securely using Google Firebase (Cloud Firestore). We use industry-standard encryption.
            </p>
            <p className="font-semibold">Payments:</p>
            <p>
              We do not store your credit card details. All transactions are processed directly by our third-party payment processor (Yoco/Paystack), which is PCI-DSS compliant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">5. Data Sharing</h2>
            <p className="mb-3">
              We do not sell your data. We share data only with:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Service Providers:</strong> Google (Hosting) and Yoco/Paystack (Payments)</li>
              <li><strong>Vendors:</strong> Limited data (e.g., Pass ID or Name) may be verifiable by vendors solely for the purpose of redeeming a deal</li>
              <li><strong>Legal Authorities:</strong> If required by South African law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">6. POPIA Compliance (South Africa)</h2>
            <p className="mb-3">
              As a South African resident, your rights under the Protection of Personal Information Act (POPIA) are respected.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Information Officer:</strong> Matthew Santillan</li>
              <li><strong>Deputy Information Officer:</strong> Tasmin Milne</li>
              <li><strong>Contact:</strong> portalfredholidaypass@gmail.com</li>
              <li><strong>Your Rights:</strong> You may request access to, correction of, or deletion of your personal data at any time</li>
              <li><strong>Consent:</strong> By using the app, you consent to the processing of your data for the purpose of delivering the Holiday Pass service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">7. Data Breach Notification</h2>
            <p>
              In the unlikely event of a data breach, we will notify the Information Regulator and affected users within reasonable time frames as mandated by POPIA Section 22.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">8. Contact Us</h2>
            <p>
              For questions about these terms, contact the Management Team (Matthew Santillan & Tasmin Milne) at: <br />
              <strong>Email:</strong> portalfredholidaypass@gmail.com <br />
              <strong>WhatsApp:</strong> 079 956 9040
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

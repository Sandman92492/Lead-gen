import React from 'react';

interface PopiaComplianceProps {
  onClose: () => void;
}

const PopiaCompliance: React.FC<PopiaComplianceProps> = ({ onClose }) => {
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

        <h2 className="text-2xl font-display font-black text-accent-primary mb-4">
          POPIA Compliance
        </h2>

        <div className="prose prose-sm max-w-none text-text-primary space-y-4 overflow-y-auto max-h-96">
          <section>
            <h3 className="font-semibold text-accent-primary text-lg mb-2">
              Protection of Personal Information Act (POPIA)
            </h3>
            <p className="text-sm text-text-secondary">
              In compliance with South Africa's Protection of Personal Information Act, 2013 (Act No. 4 of 2013), we inform you of the following:
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-accent-primary mb-2">1. Collection and Processing of Personal Information</h4>
            <p className="text-sm text-text-secondary">
              We collect and process your personal information, including but not limited to your name, email address, and payment details, to provide you with our holiday pass services.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-accent-primary mb-2">2. Purpose of Processing</h4>
            <p className="text-sm text-text-secondary">
              Your personal information is processed for the following purposes:
            </p>
            <ul className="text-sm text-text-secondary list-disc list-inside space-y-1">
              <li>To create and manage your account</li>
              <li>To process pass purchases and redemptions</li>
              <li>To provide customer support</li>
              <li>To comply with legal and regulatory requirements</li>
              <li>To send you relevant updates about your passes and services</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-accent-primary mb-2">3. Legal Basis for Processing</h4>
            <p className="text-sm text-text-secondary">
              We process your personal information based on your explicit consent, which you provide by checking this box during account creation.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-accent-primary mb-2">4. Data Security</h4>
            <p className="text-sm text-text-secondary">
              We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-accent-primary mb-2">5. Data Retention</h4>
            <p className="text-sm text-text-secondary">
              We retain your personal information for as long as necessary to provide our services and fulfill our legal obligations. When you request account deletion, we will remove your personal information in accordance with POPIA requirements.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-accent-primary mb-2">6. Your Rights</h4>
            <p className="text-sm text-text-secondary">
              Under POPIA, you have the right to:
            </p>
            <ul className="text-sm text-text-secondary list-disc list-inside space-y-1">
              <li>Request access to your personal information</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to the processing of your data</li>
              <li>Request restriction of processing</li>
              <li>Withdraw your consent at any time</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-accent-primary mb-2">7. Contact Information</h4>
            <p className="text-sm text-text-secondary">
              If you have any questions about how we handle your personal information or wish to exercise your rights under POPIA, please contact us at support@holidaypass.com.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-accent-primary mb-2">8. Consent Confirmation</h4>
            <p className="text-sm text-text-secondary">
              By checking the POPIA Compliance checkbox, you explicitly confirm that you have read and understood this notice, and you consent to the collection and processing of your personal information as described above.
            </p>
          </section>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition font-semibold"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default PopiaCompliance;

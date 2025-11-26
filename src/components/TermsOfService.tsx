import React from 'react';
import Button from './Button';

interface TermsOfServiceProps {
  onClose: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
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
            Terms of Service
          </h1>
          <p className="text-text-secondary text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6 text-text-primary overflow-y-auto max-h-[60vh]">
          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Port Alfred Holiday Pass application, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">2. License</h2>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to use the application for your personal,
              non-commercial use only. You may not modify, copy, distribute, or use the application for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">3. User Responsibilities</h2>
            <p className="mb-3">You agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate and complete information when creating an account</li>
              <li>Maintain confidentiality of your password</li>
              <li>Use the app only for legitimate purposes</li>
              <li>Not engage in fraudulent or illegal activities</li>
              <li>Not attempt to reverse-engineer or hack the application</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">4. Pass Terms</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Validity and Expiration</h3>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Holiday passes are valid from December 1st through January 31st</li>
                    <li>Passes cannot be used after January 31st</li>
                 </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Redemption</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Each deal can be redeemed once per visit</li>
                  <li>Businesses reserve the right to verify pass validity before redemption</li>
                  <li>Redemptions are final and non-transferable</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Transferability</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Plus One passes may be transferred to one additional person</li>
                  <li>Transfers must be done before redemption</li>
                  <li>Only the registered owner or transferred recipient may use the pass</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">5. Payment and Refunds</h2>
            <p className="mb-3">
              Payments are processed securely through Yoco. All prices are in the currency specified at checkout.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Cooling-Off Period (ECTA Section 25)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You have 7 calendar days from purchase to cancel your pass</li>
                  <li>To cancel, email: portalfredholidaypass@gmail.com with your order reference</li>
                  <li>If you have redeemed any deals, cooling-off rights are forfeited</li>
                  <li>This is your statutory right under South African law (ECTA)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Refund Policy</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Refunds are available within 14 days of purchase if no redemptions have been made</li>
                  <li>Once a pass has been redeemed, it is non-refundable</li>
                  <li>Refunds will be processed to the original payment method</li>
                  <li>Processing time: 5-10 business days</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">6. Limitation of Liability</h2>
            <p>
              Port Alfred Holiday Pass is provided "as is" without warranties. We are not liable for direct, indirect,
              incidental, special, or consequential damages arising from your use of the application, including but not
              limited to loss of data, business interruption, or personal injury.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">7. Business Partner Terms</h2>
            <p>
              We do not control or endorse the quality of products/services offered by partner businesses. They operate
              independently and are responsible for their own operations, customer service, and dispute resolution.
              Claims should be directed to the respective business, not to us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">8. Suspension and Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent
              activity, or attempt to misuse the service. Violations may result in permanent bans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">9. Intellectual Property</h2>
            <p>
              All content, logos, designs, and intellectual property in the application are owned by Port Alfred Holiday Pass
              or our partners. You may not reproduce, distribute, or use them without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">10. Governing Law</h2>
            <p>
              These terms are governed by the laws of South Africa. Any disputes will be resolved in the courts of
              South Africa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">11. Changes to Terms</h2>
            <p>
              We may update these terms periodically. Continued use of the application constitutes acceptance of updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-accent-primary mb-3">12. Contact</h2>
            <p>
              For questions about these terms, contact us at: <br />
              <strong>Email:</strong> portalfredholidaypass@gmail.com <br />
              <strong>WhatsApp:</strong> 065 806 2198
            </p>
          </section>
        </div>

        <div className="mt-6 border-t border-border-subtle pt-6">
          <Button type="button" variant="primary" className="w-full" onClick={onClose}>
            I Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

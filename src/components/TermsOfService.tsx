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
          <h1 className="text-3xl font-display font-black text-action-primary mb-4">
            Terms of Service
          </h1>
          <p className="text-text-secondary text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6 text-text-primary overflow-y-auto max-h-[60vh]">
          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">1. Legal Entity & Acceptance</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User") and Matthew Santillan trading as Port Alfred Holiday Pass ("the Provider"). By purchasing or using the pass, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">2. The Service (Platform Only)</h2>
            <p className="mb-3">
              The Port Alfred Holiday Pass is a digital marketing voucher platform. We provide access to discounts offered by third-party businesses ("Vendors").
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>We are not the supplier of the food, activities, or goods</li>
              <li>The contract for the sale of goods/services is strictly between you and the Vendor</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">3. Pass Validity & Rules</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Validity:</strong> 1 December 2025 – 31 January 2026</li>
              <li><strong>Expiry:</strong> The pass automatically expires on 31 Jan 2026. Unused deals are forfeited</li>
              <li><strong>Single User License:</strong> The pass is valid for use by the registered account holder only. It is non-transferable once a deal has been redeemed</li>
              <li><strong>Verification:</strong> Vendors reserve the right to request ID to match the name on the Digital Pass</li>
              <li><strong>Redemption:</strong> Each deal is valid for one-time use per pass, unless specified otherwise in the specific Deal Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">4. Payments & Refunds (CPA & ECTA)</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Cooling-Off Period</h3>
                <p>In terms of the Electronic Communications and Transactions Act (ECTA), you are entitled to cancel your purchase within 7 days of payment, provided no deals have been redeemed.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Refund Process</h3>
                <p>To request a refund, email portalfredholidaypass@gmail.com.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Non-Refundable</h3>
                <p>Once a single deal has been redeemed, or after the 7-day cooling-off period, the pass is non-refundable.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Vendor Availability</h3>
                <p>We do not guarantee that every Vendor will be open at all times (e.g., due to weather or capacity). Vendor unavailability does not constitute grounds for a full refund of the Pass.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">5. Limitation of Liability (Important)</h2>
            <p className="mb-3">To the fullest extent permitted by South African law:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Indemnity:</strong> You agree to indemnify Matthew Santillan (t/a Port Alfred Holiday Pass) against any claims arising from your use of the Vendor services</li>
              <li><strong>No Liability for Vendors:</strong> We are not liable for any injury, illness, loss, or damage experienced at a Vendor's premises (e.g., food poisoning, activity injuries, or poor service). Your claim lies solely with the Vendor</li>
              <li><strong>App Uptime:</strong> We strive for 100% uptime but are not liable for temporary technical glitches that prevent redemption at a specific moment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">6. User Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Attempt to duplicate, screenshot, or forge the digital pass</li>
              <li>Share your login details to allow multiple people to use a single pass</li>
              <li>Abuse staff at Partner Venues. (We reserve the right to revoke passes for abusive behavior without refund)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">7. Governing Law & Domicilium</h2>
            <p className="mb-3">
              These terms are governed by the laws of the Republic of South Africa.
            </p>
            <p>
              <strong>Physical Service Address (Domicilium):</strong> <br />
              1404, Albany RD, Port Alfred, 6170
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-action-primary mb-3">8. Contact</h2>
            <p>
              <strong>Email:</strong> portalfredholidaypass@gmail.com <br />
              <strong>WhatsApp:</strong> 079 956 9040
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

import React from 'react';

interface PaymentCancelProps {
  onClose: () => void;
}

const PaymentCancel: React.FC<PaymentCancelProps> = ({ onClose }) => {

  return (
    <div className="fixed inset-0 bg-bg-primary flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-bg-card rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center border border-border-subtle my-8">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-text-secondary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-display font-black text-action-primary mb-3">
          Payment Cancelled
        </h1>

        <p className="text-text-secondary mb-6">
          Your payment has been cancelled. No charges have been made to your account.
        </p>

        <p className="text-sm text-text-secondary/70 mb-8">
          Feel free to try again whenever you're ready.
        </p>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-accent-primary text-white font-bold rounded-lg hover:bg-accent-primary/90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;

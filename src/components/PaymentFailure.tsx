import React from 'react';

interface PaymentFailureProps {
  onClose: () => void;
  onRetry?: () => void;
}

const PaymentFailure: React.FC<PaymentFailureProps> = ({ onClose, onRetry }) => {

  return (
    <div className="fixed inset-0 bg-bg-primary flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-bg-card rounded-[var(--r-lg)] shadow-2xl p-8 sm:p-12 max-w-md w-full text-center border border-border-subtle my-8">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-display font-black text-red-500 mb-3">
          Payment Failed
        </h1>

        <p className="text-text-secondary mb-6">
          Unfortunately, your payment could not be processed. Please check your card details and try again.
        </p>

        <p className="text-sm text-text-secondary/70 mb-8">
          If the problem persists, please contact support or try a different payment method.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-bg-primary border-2 border-border-subtle text-text-primary font-bold rounded-[var(--r-md)] hover:bg-bg-card transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-accent-primary text-white font-bold rounded-[var(--r-md)] hover:bg-accent-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;

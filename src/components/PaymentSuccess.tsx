import React, { useEffect } from 'react';

interface PaymentSuccessProps {
  onClose: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onClose }) => {
  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-bg-primary flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-bg-card rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center border border-border-subtle my-8">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-accent-primary animate-pulse"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-display font-black text-action-primary mb-3">
          Payment Successful!
        </h1>

        <p className="text-text-secondary mb-6">
          Your pass has been activated and is now available in your account.
        </p>

        <p className="text-sm text-text-secondary/70 mb-8">
          Redirecting you home in 5 seconds...
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

export default PaymentSuccess;

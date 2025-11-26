import React, { useState, useEffect } from 'react';

interface SwipeHintProps {
  show: boolean;
  onDismiss: () => void;
}

const SwipeHint: React.FC<SwipeHintProps> = ({ show, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show) {
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={onDismiss} />
      
      {/* Hint card */}
      <div
        className="relative pointer-events-auto bg-white rounded-xl shadow-2xl p-6 mx-4 max-w-sm
          animate-in fade-in zoom-in duration-300"
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close hint"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="space-y-3">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-action-primary/10 p-3 rounded-full">
              <svg className="w-6 h-6 text-action-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H6" />
              </svg>
            </div>
          </div>

          {/* Text */}
          <h3 className="text-center text-lg font-bold text-gray-900">
            View More Images
          </h3>
          <p className="text-center text-sm text-gray-600">
            Use the arrow buttons to browse through photos of this deal.
          </p>

          {/* Hint animation */}
          <div className="flex justify-center gap-2 pt-2">
            <div className="flex gap-1 items-center px-3 py-2 bg-gray-100 rounded-lg">
              <svg className="w-4 h-4 text-action-primary animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 10 10.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-gray-700">Use arrows</span>
            </div>
          </div>
        </div>

        {/* Dismiss hint */}
        <p className="text-xs text-gray-400 text-center mt-4">
          This will close in a few seconds
        </p>
      </div>
    </div>
  );
};

export default SwipeHint;

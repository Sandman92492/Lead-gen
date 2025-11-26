import React, { ReactNode } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'; // Default sm
  showCloseButton?: boolean;
  closeButtonPosition?: 'top-right' | 'bottom'; // Default top-right
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  showCloseButton = true,
  closeButtonPosition = 'top-right',
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-bg-card rounded-2xl shadow-2xl p-6 sm:p-8 ${maxWidthClasses[maxWidth]} w-full relative border border-border-subtle my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right (default) */}
        {showCloseButton && closeButtonPosition === 'top-right' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-action-primary rounded-md p-1"
            aria-label="Close modal"
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
        )}

        {/* Title (optional) */}
        {title && (
          <h2 className="text-2xl sm:text-3xl font-display font-black text-accent-primary mb-4">
            {title}
          </h2>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
          {children}
        </div>

        {/* Close Button - Bottom (optional) */}
        {showCloseButton && closeButtonPosition === 'bottom' && (
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 rounded-lg bg-bg-primary text-text-primary font-medium hover:bg-bg-primary/80 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default BaseModal;

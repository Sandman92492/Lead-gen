import React, { ReactNode } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'; // Default sm
  showCloseButton?: boolean;
  closeButtonPosition?: 'top-right' | 'bottom'; // Default top-right
  zIndex?: number; // Default 50 (z-50)
  backdropClassName?: string;
  panelClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  closeButtonClassName?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  showCloseButton = true,
  closeButtonPosition = 'top-right',
  zIndex = 50,
  backdropClassName = '',
  panelClassName = '',
  titleClassName = '',
  contentClassName = '',
  closeButtonClassName = '',
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
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-200 ${backdropClassName}`}
      style={{ zIndex }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-bg-card rounded-[var(--r-lg)] p-4 sm:p-6 md:p-8 ${maxWidthClasses[maxWidth]} w-full relative border border-border-subtle my-3 sm:my-8 ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right (default) */}
        {showCloseButton && closeButtonPosition === 'top-right' && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--card)] rounded-md p-1 ${closeButtonClassName}`}
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
          <h2 className={`text-2xl sm:text-3xl font-display font-black text-text-primary mb-4 tracking-tight ${titleClassName}`}>
            {title}
          </h2>
        )}

        {/* Content */}
        <div className={contentClassName}>
          {children}
        </div>

        {/* Close Button - Bottom (optional) */}
        {showCloseButton && closeButtonPosition === 'bottom' && (
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 rounded-[var(--r-md)] bg-bg-primary text-text-primary font-medium hover:bg-bg-primary/80 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default BaseModal;

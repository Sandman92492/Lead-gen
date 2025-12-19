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
      className={`fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-200 backdrop-blur-sm ${backdropClassName}`}
      style={{ zIndex }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-bg-card rounded-[var(--r-xl)] p-6 sm:p-8 ${maxWidthClasses[maxWidth]} w-full relative border-2 border-action-primary shadow-2xl my-3 sm:my-8 ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right (default) */}
        {showCloseButton && closeButtonPosition === 'top-right' && (
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-4 focus:ring-action-primary/10 rounded-full p-2 bg-bg-primary/50 border border-border-subtle ${closeButtonClassName}`}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Title (optional) */}
        {title && (
          <h2 className={`text-2xl sm:text-3xl font-black text-text-primary mb-6 tracking-tighter uppercase italic px-1 ${titleClassName}`}>
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
            className="w-full h-14 mt-8 rounded-[var(--r-md)] bg-slate-900 text-white font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-colors shadow-lg active:scale-[0.98]"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default BaseModal;

import React from 'react';

interface GuideTipProps {
  children: React.ReactNode;
  className?: string;
}

const GuideTip: React.FC<GuideTipProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-[var(--r-md)] ${className}`}>
      <svg
        className="w-4 h-4 text-primary flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-text-secondary leading-snug">{children}</p>
    </div>
  );
};

export default GuideTip;

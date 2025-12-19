import React from 'react';
import PrimaryButton from './PrimaryButton';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="lw-card relative p-6 text-center animate-lw-fade-up">
      {/* Decorative background pattern */}
      <div className="relative">
        <div className="mx-auto h-12 w-12 rounded-[var(--r-lg)] bg-action-primary/10 text-action-primary grid place-items-center">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" opacity="0.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" opacity="0.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="17.5" cy="17.5" r="1" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl leading-7 font-bold text-text-primary tracking-tight">{title}</h2>
        {description && <p className="mt-2 text-base leading-6 text-text-secondary max-w-[320px] mx-auto">{description}</p>}
        {actionLabel && onAction && (
          <div className="mt-5">
            <PrimaryButton className="w-full" onClick={onAction}>
              {actionLabel}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

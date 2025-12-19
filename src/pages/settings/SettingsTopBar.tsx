import React from 'react';
import { useNavigate } from 'react-router-dom';
import { haptics } from '../../utils/haptics';
import ThemeToggle from '../../components/ThemeToggle';

type SettingsTopBarProps = {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
  statusText?: string;
  onBack?: () => void;
};

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M10 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SettingsTopBar: React.FC<SettingsTopBarProps> = ({ title, showBack = false, right, statusText, onBack }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-card">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 min-h-14 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              type="button"
              className="h-10 w-10 grid place-items-center rounded-[14px] text-text-primary hover:bg-bg-primary/60 active:bg-bg-primary/80 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
              onClick={() => {
                haptics.tap();
                if (onBack) onBack();
                else navigate(-1);
              }}
              aria-label="Back"
            >
              <ArrowLeftIcon />
            </button>
          )}
          <div className="min-w-0">
            <div className="text-[16px] leading-5 font-semibold text-text-primary truncate">{title}</div>
            <div className="mt-0.5 text-[12px] leading-4 text-text-secondary">{statusText || '\u00A0'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default SettingsTopBar;

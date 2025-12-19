import React from 'react';
import ThemeToggle from './ThemeToggle';

type PublicBrandHeaderProps = {
  businessName: string;
  logoUrl?: string;
};

const PublicBrandHeader: React.FC<PublicBrandHeaderProps> = ({ businessName, logoUrl }) => {
  const initial = (businessName || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="w-full">
      <div className="mx-auto w-full max-w-md px-4 pt-6 pb-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={businessName}
              className="h-11 w-11 rounded-2xl object-cover border border-border-subtle bg-bg-card"
              loading="eager"
            />
          ) : (
            <div className="h-11 w-11 rounded-2xl bg-action-primary text-white grid place-items-center font-bold shadow-[var(--shadow-card)]">
              {initial}
            </div>
          )}

          <div className="min-w-0">
            <div className="text-[13px] leading-5 font-semibold text-text-primary truncate">{businessName}</div>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
};

export default PublicBrandHeader;


import React from 'react';

type TopBarProps = {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

const TopBar: React.FC<TopBarProps> = ({ title, left, right }) => {
  return (
    <header className="lw-sticky-top-bar">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="shrink-0">{left}</div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-text-primary tracking-tight truncate">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">{right}</div>
      </div>
    </header>
  );
};

export default TopBar;

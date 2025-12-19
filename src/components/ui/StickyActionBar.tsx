import React from 'react';

type StickyActionBarProps = {
  children: React.ReactNode;
};

const StickyActionBar: React.FC<StickyActionBarProps> = ({ children }) => {
  return (
    <div className="fixed left-0 right-0 z-40 bottom-[var(--sticky-bottom-offset)] md:bottom-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="bg-bg-card border border-border-subtle rounded-[22px] p-2">{children}</div>
      </div>
    </div>
  );
};

export default StickyActionBar;

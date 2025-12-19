import React from 'react';

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
};

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const ListRow: React.FC<ListRowProps> = ({ title, subtitle, icon, onClick, href, destructive = false }) => {
  const content = (
    <>
      {icon && (
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-[12px] bg-bg-primary text-text-secondary shrink-0 ${
            destructive ? 'text-alert bg-alert/5' : ''
          }`}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={`block text-[14px] leading-5 font-semibold truncate ${destructive ? 'text-alert' : 'text-text-primary'}`}>{title}</span>
        {subtitle && <span className="mt-0.5 block text-[12px] leading-4 text-text-secondary truncate">{subtitle}</span>}
      </span>
      <span className={`shrink-0 ${destructive ? 'text-alert/70' : 'text-text-secondary'}`} aria-hidden="true">
        <ChevronRightIcon />
      </span>
    </>
  );

  const className = `w-full h-14 px-4 flex items-center gap-3 text-left bg-bg-card active:bg-bg-primary/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] border-b border-border-subtle`;

  if (href) {
    return (
      <a className={className} href={href} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
};

export default ListRow;

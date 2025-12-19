import React from 'react';

type RowProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  showChevron?: boolean;
  divider?: boolean;
  className?: string;
};

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Row: React.FC<RowProps> = ({
  title,
  subtitle,
  icon,
  right,
  onClick,
  href,
  showChevron,
  divider = true,
  className,
}) => {
  const isInteractive = Boolean(onClick || href);
  const shouldShowChevron = showChevron ?? (isInteractive && !right);

  const content = (
    <>
      {icon && (
        <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-bg-primary text-text-secondary shrink-0">
          {icon}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-base leading-5 font-semibold text-text-primary truncate">{title}</span>
        {subtitle && <span className="mt-1 block text-sm leading-4 text-text-secondary truncate">{subtitle}</span>}
      </span>

      {right && <span className="shrink-0">{right}</span>}

      {shouldShowChevron && (
        <span className="shrink-0 text-text-secondary" aria-hidden="true">
          <ChevronRightIcon />
        </span>
      )}
    </>
  );

  const baseClassName = `w-full min-h-16 px-4 py-3 flex items-center gap-3 text-left bg-bg-card focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] active:bg-bg-primary/60 ${
    divider ? 'border-b border-border-subtle' : ''
  } ${className || ''}`;

  if (href) {
    return (
      <a className={baseClassName} href={href} onClick={onClick}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" className={baseClassName} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={baseClassName}>{content}</div>;
};

export default Row;

import React from 'react';

export type StatusTone = 'green' | 'yellow' | 'red' | 'neutral';

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

const toneStyles: Record<StatusTone, { container: string; icon: JSX.Element }> = {
  green: {
    container:
      'bg-gradient-to-b from-success to-success/85 text-white border-white/15 shadow-[0_12px_28px_rgba(15,23,42,0.14)]',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  yellow: {
    container:
      'bg-gradient-to-b from-brand-yellow to-brand-yellow/80 text-brand-dark-blue border-white/25 shadow-[0_12px_28px_rgba(15,23,42,0.14)]',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 8v5l3 2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z"
          stroke="currentColor"
          strokeWidth="2.0"
        />
      </svg>
    ),
  },
  red: {
    container:
      'bg-gradient-to-b from-urgency-high to-urgency-high/85 text-white border-white/15 shadow-[0_12px_28px_rgba(15,23,42,0.16)]',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 9v4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M12 17h.01" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M10.2 4.9a2 2 0 0 1 3.6 0l8.2 16.3A1.6 1.6 0 0 1 20.6 23H3.4A1.6 1.6 0 0 1 2 21.2L10.2 4.9Z"
          stroke="currentColor"
          strokeWidth="2.0"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  neutral: {
    container: 'bg-gradient-to-b from-bg-primary to-bg-primary/80 text-text-secondary border-border-subtle/70',
    icon: (
      <span className="h-2 w-2 rounded-full bg-border-subtle" aria-hidden="true" />
    ),
  },
};

const StatusPill: React.FC<StatusPillProps> = ({ label, tone = 'neutral', className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase px-3.5 py-2 rounded-full border ring-1 ring-black/5 ${toneStyles[tone].container} ${className}`}
    >
      {toneStyles[tone].icon}
      <span className="leading-none">{label}</span>
    </div>
  );
};

export default StatusPill;

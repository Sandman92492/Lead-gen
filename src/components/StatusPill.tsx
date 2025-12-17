import React from 'react';

export type StatusTone = 'green' | 'yellow' | 'red' | 'neutral';

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

const toneStyles: Record<StatusTone, { container: string; dot: string }> = {
  green: { container: 'bg-success/25 border-success/50 text-success', dot: 'bg-success' },
  yellow: { container: 'bg-brand-yellow/25 border-brand-yellow/60 text-brand-yellow', dot: 'bg-brand-yellow' },
  red: { container: 'bg-urgency-high/25 border-urgency-high/60 text-urgency-high', dot: 'bg-urgency-high' },
  neutral: { container: 'bg-bg-primary border-border-subtle text-text-secondary', dot: 'bg-border-subtle' },
};

const StatusPill: React.FC<StatusPillProps> = ({ label, tone = 'neutral', className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] px-3 py-1 rounded-full border-2 ${toneStyles[tone].container} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${toneStyles[tone].dot}`} aria-hidden="true" />
      <span className="leading-none">{label}</span>
    </div>
  );
};

export default StatusPill;

import React, { useMemo, useState } from 'react';

const normalizeDigits = (value: string | null | undefined): string => (value ?? '').replace(/\D/g, '');

const groupDigits = (digits: string, groupSize: number): string => {
  if (!digits) return '';
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += groupSize) {
    groups.push(digits.slice(i, i + groupSize));
  }
  return groups.join(' ');
};

const placeholderFor = (digits: number, groupSize: number): string => {
  const groups = Math.ceil(digits / groupSize);
  const group = Array.from({ length: groupSize }, () => '—').join(' ');
  return Array.from({ length: groups }, () => group).join('  ');
};

type RotatingCodeDisplayProps = {
  code: string | null;
  isLoading?: boolean;
  digits?: number;
  groupSize?: number;
  label: string;
  subtitle?: string;
  secondsRemaining?: number | null;
  variant?: 'default' | 'transparent';
};

const RotatingCodeDisplay: React.FC<RotatingCodeDisplayProps> = ({
  code,
  isLoading = false,
  digits = 4,
  groupSize = 2,
  label,
  subtitle,
  secondsRemaining = null,
  variant = 'default',
}) => {
  const [showTimer, setShowTimer] = useState(false);

  const display = useMemo(() => {
    if (isLoading) return groupDigits('•'.repeat(digits), groupSize);
    const normalized = normalizeDigits(code).slice(0, digits);
    if (!normalized) return placeholderFor(digits, groupSize);
    return groupDigits(normalized, groupSize);
  }, [code, digits, groupSize, isLoading]);

  const a11yValue = useMemo(() => {
    const normalized = normalizeDigits(code).slice(0, digits);
    return normalized || '';
  }, [code, digits]);

  const hasTimer = secondsRemaining !== null;
  const hasMeta = Boolean(subtitle) || hasTimer;

  // Variant styles
  const containerClass = variant === 'transparent'
    ? 'bg-white/10 border border-white/20 text-white'
    : 'bg-bg-primary border border-border-subtle text-text-primary';

  const labelClass = variant === 'transparent' ? 'text-white/60' : 'text-text-secondary';
  const displayClass = variant === 'transparent' ? 'text-white' : 'text-text-primary';

  return (
    <div className="text-center my-6">
      <div className="flex items-center justify-between gap-3">
        <div className={`text-xs uppercase tracking-widest ${labelClass}`}>{label}</div>
        <div className="flex items-center gap-2">
          {hasTimer && !showTimer && (
            <div className={`inline-flex items-center gap-1.5 text-xs ${labelClass}`} aria-label="Auto-refreshing">
              <span className="h-2 w-2 rounded-full bg-success animate-live-pulse" aria-hidden="true" />
              <span>Live</span>
            </div>
          )}

          {hasMeta && (
            <button
              type="button"
              onClick={() => setShowTimer((prev) => !prev)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${showTimer
                ? 'bg-action-primary border-action-primary text-white'
                : variant === 'transparent'
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  : 'bg-bg-primary border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              aria-pressed={showTimer}
              aria-label={showTimer ? 'Hide timer details' : 'Show timer details'}
            >
              {showTimer ? 'Hide' : 'Timer'}
            </button>
          )}
        </div>
      </div>

      {showTimer && hasMeta && (
        <div className={`mt-2 flex items-center justify-between gap-3 rounded-2xl px-4 py-2 ${variant === 'transparent' ? 'bg-black/20 border border-white/10 text-white' : 'bg-bg-primary border border-border-subtle'
          }`}>
          <div className={`text-xs ${variant === 'transparent' ? 'text-white/70' : 'text-text-secondary'}`}>{subtitle || 'Rotates automatically'}</div>
          {hasTimer && (
            <div className={`text-xs font-semibold tabular-nums ${variant === 'transparent' ? 'text-white' : 'text-text-primary'}`} aria-label="Seconds remaining">
              {secondsRemaining}s
            </div>
          )}
        </div>
      )}

      <div className={`mt-4 rounded-2xl px-4 py-5 ${containerClass} backdrop-blur-sm transition-colors duration-300`}>
        <div
          className={`font-mono text-5xl sm:text-6xl font-black tracking-[0.14em] whitespace-pre ${displayClass}`}
          aria-label={a11yValue ? `Code ${a11yValue}` : 'Code unavailable'}
        >
          {display}
        </div>
      </div>
    </div>
  );
};

export default RotatingCodeDisplay;

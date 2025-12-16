import React, { useMemo } from 'react';
import { useRotatingCode } from '../hooks/useRotatingCode';

type GuestCredentialPageProps = {
  token: string;
};

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const GuestCredentialPage: React.FC<GuestCredentialPageProps> = ({ token }) => {
  const { isLoading, error, code, secondsRemaining, credential } = useRotatingCode({ guestToken: token });

  const tone = useMemo(() => {
    if (!credential) return 'yellow' as const;
    const now = Date.now();
    const validFromMs = Date.parse(credential.validFrom);
    const validToMs = Date.parse(credential.validTo);
    if (credential.status !== 'active') return 'red' as const;
    if (!Number.isFinite(validFromMs) || !Number.isFinite(validToMs)) return 'red' as const;
    if (now < validFromMs) return 'yellow' as const;
    if (now > validToMs) return 'red' as const;
    return 'yellow' as const;
  }, [credential]);

  const toneClasses =
    tone === 'red'
      ? 'bg-urgency-high/15 border-urgency-high text-urgency-high'
      : 'bg-brand-yellow/15 border-brand-yellow text-brand-yellow';

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-black text-action-primary">Guest Pass</h1>
          <p className="text-text-secondary mt-1">Show this code at the checkpoint</p>
        </div>

        {error && (
          <div className="bg-urgency-high/10 border border-urgency-high rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-urgency-high">{error}</p>
          </div>
        )}

        <div className="bg-bg-card border border-border-subtle rounded-2xl shadow-[var(--shadow)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className={`text-xs font-bold tracking-widest px-3 py-1 rounded-full border ${toneClasses}`}>
              {tone === 'red' ? 'EXPIRED' : 'ACTIVE GUEST'}
            </div>
            <div className="text-xs text-text-secondary">
              {secondsRemaining !== null ? `Refresh in ${secondsRemaining}s` : '—'}
            </div>
          </div>

          <div className="text-center my-6">
            <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Verification Code</div>
            <div className="font-mono text-6xl font-black tracking-[0.25em] text-action-primary">
              {isLoading ? '••••' : (code || '— — — —')}
            </div>
          </div>

          <div className="border-t border-border-subtle pt-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-text-secondary">Guest</span>
              <span className="text-sm font-semibold text-text-primary text-right">{credential?.displayName || 'Guest'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-text-secondary">Valid Until</span>
              <span className="text-sm font-semibold text-text-primary text-right">
                {credential?.validTo ? formatDate(credential.validTo) : '—'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-text-secondary mt-4">
          This pass expires automatically after its valid window.
        </p>
      </div>
    </main>
  );
};

export default GuestCredentialPage;


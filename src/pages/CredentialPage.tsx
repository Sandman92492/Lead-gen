import React, { useMemo } from 'react';
import { useRotatingCode } from '../hooks/useRotatingCode';
import { useAuth } from '../context/AuthContext';

const EXPIRING_SOON_DAYS = 7;

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const computeStatus = (credential: { status: string; credentialType: string; validFrom: string; validTo: string }) => {
  const now = Date.now();
  const validFromMs = Date.parse(credential.validFrom);
  const validToMs = Date.parse(credential.validTo);

  if (credential.status !== 'active') return { label: 'INACTIVE', tone: 'red' as const };
  if (!Number.isFinite(validFromMs) || !Number.isFinite(validToMs)) return { label: 'INVALID', tone: 'red' as const };
  if (now < validFromMs) return { label: 'NOT YET VALID', tone: 'yellow' as const };
  if (now > validToMs) return { label: 'EXPIRED', tone: 'red' as const };
  if (credential.credentialType === 'guest') return { label: 'GUEST', tone: 'yellow' as const };

  const expiringSoonMs = EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000;
  if (validToMs - now <= expiringSoonMs) return { label: 'EXPIRING SOON', tone: 'yellow' as const };
  return { label: 'ACTIVE', tone: 'green' as const };
};

const CredentialPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, error, code, secondsRemaining, credential } = useRotatingCode({ user });

  const status = useMemo(() => {
    if (!credential) return null;
    return computeStatus(credential);
  }, [credential]);

  const toneClasses = status?.tone === 'green'
    ? 'bg-success/15 border-success text-success'
    : status?.tone === 'yellow'
      ? 'bg-brand-yellow/15 border-brand-yellow text-brand-yellow'
      : 'bg-urgency-high/15 border-urgency-high text-urgency-high';

  return (
    <main className="min-h-[calc(100vh-6rem)] pb-24 sm:pb-8 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6 pt-8 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-black text-action-primary">Digital Credential</h1>
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
              {status?.label || '—'}
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
              <span className="text-xs text-text-secondary">Name</span>
              <span className="text-sm font-semibold text-text-primary text-right">{credential?.displayName || user?.displayName || '—'}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-text-secondary">Member / Unit</span>
              <span className="text-sm font-semibold text-text-primary text-right">
                {credential?.memberNo || credential?.unitNo || '—'}
              </span>
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
          Codes refresh automatically and can only be validated by staff.
        </p>
      </div>
    </main>
  );
};

export default CredentialPage;


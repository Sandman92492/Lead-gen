import React, { useCallback, useMemo, useState } from 'react';
import { useRotatingCode } from '../hooks/useRotatingCode';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { createCredential } from '../services/accessService';

const EXPIRING_SOON_DAYS = 7;
const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;

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
  const [guestName, setGuestName] = useState('');
  const [guestValidFrom, setGuestValidFrom] = useState(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [guestValidTo, setGuestValidTo] = useState(() => {
    const later = new Date(Date.now() + 4 * 60 * 60 * 1000);
    later.setSeconds(0, 0);
    return later.toISOString().slice(0, 16);
  });
  const [guestLink, setGuestLink] = useState<string | null>(null);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);

  const status = useMemo(() => {
    if (!credential) return null;
    return computeStatus(credential);
  }, [credential]);

  const toneClasses = status?.tone === 'green'
    ? 'bg-success/15 border-success text-success'
    : status?.tone === 'yellow'
      ? 'bg-brand-yellow/15 border-brand-yellow text-brand-yellow'
      : 'bg-urgency-high/15 border-urgency-high text-urgency-high';

  const canCreateGuest = credential?.credentialType === 'member' || credential?.credentialType === 'resident';

  const handleCreateGuest = useCallback(async () => {
    setGuestError(null);
    setGuestLink(null);
    if (!credential) {
      setGuestError('Credential not loaded.');
      return;
    }

    const validFromMs = Date.parse(guestValidFrom);
    const validToMs = Date.parse(guestValidTo);
    if (!Number.isFinite(validFromMs) || !Number.isFinite(validToMs)) {
      setGuestError('Invalid dates.');
      return;
    }
    if (validToMs <= validFromMs) {
      setGuestError('validTo must be after validFrom.');
      return;
    }

    setIsCreatingGuest(true);
    try {
      if (mode !== 'firebase' || !user || typeof user.getIdToken !== 'function') {
        const result = await createCredential({
          orgId: credential.orgId,
          userId: null,
          credentialType: 'guest',
          status: 'active',
          validFrom: new Date(validFromMs).toISOString(),
          validTo: new Date(validToMs).toISOString(),
          displayName: guestName.trim() || 'Guest',
          memberNo: undefined,
          unitNo: undefined,
        });
        if (!result.success || !result.credentialId) {
          setGuestError(result.error || 'Failed to create guest pass.');
          setIsCreatingGuest(false);
          return;
        }
        setGuestLink(`/guest/${result.credentialId}`);
        setIsCreatingGuest(false);
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/.netlify/functions/create-guest-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          guestName: guestName.trim() || undefined,
          validFrom: new Date(validFromMs).toISOString(),
          validTo: new Date(validToMs).toISOString(),
        }),
      });

      const data = (await response.json()) as { guestUrl?: string; error?: string };
      if (!response.ok || !data.guestUrl) {
        setGuestError(data.error || 'Failed to create guest pass.');
        setIsCreatingGuest(false);
        return;
      }

      setGuestLink(data.guestUrl);
      setIsCreatingGuest(false);
    } catch {
      setGuestError('Network error. Please try again.');
      setIsCreatingGuest(false);
    }
  }, [credential, guestName, guestValidFrom, guestValidTo, user]);

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

        {canCreateGuest && (
          <section className="mt-6 bg-bg-card border border-border-subtle rounded-2xl shadow-[var(--shadow)] p-5">
            <h2 className="font-semibold text-text-primary">Create Guest Pass</h2>
            <p className="text-sm text-text-secondary mt-1">Generate a shareable link for a guest.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Guest name (optional)</label>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Guest"
                  className="w-full px-4 py-3 bg-bg-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-action-primary"
                  disabled={isCreatingGuest}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Valid from</label>
                  <input
                    type="datetime-local"
                    value={guestValidFrom}
                    onChange={(e) => setGuestValidFrom(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-action-primary"
                    disabled={isCreatingGuest}
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Valid to</label>
                  <input
                    type="datetime-local"
                    value={guestValidTo}
                    onChange={(e) => setGuestValidTo(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-action-primary"
                    disabled={isCreatingGuest}
                  />
                </div>
              </div>

              {guestError && (
                <div className="bg-urgency-high/10 border border-urgency-high rounded-lg p-3">
                  <p className="text-sm font-semibold text-urgency-high">{guestError}</p>
                </div>
              )}

              <Button variant="primary" className="w-full" onClick={handleCreateGuest} disabled={isCreatingGuest}>
                {isCreatingGuest ? 'Creating…' : 'Create Guest Link'}
              </Button>

              {guestLink && (
                <div className="bg-bg-primary border border-border-subtle rounded-lg p-3">
                  <p className="text-xs text-text-secondary mb-1">Share link</p>
                  <div className="flex items-center gap-2">
                    <input
                      value={guestLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-bg-card border border-border-default rounded-lg font-mono text-xs"
                    />
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(guestLink);
                        } catch {
                          // Ignore clipboard errors
                        }
                      }}
                      className="text-xs font-semibold text-action-primary hover:underline"
                      type="button"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default CredentialPage;

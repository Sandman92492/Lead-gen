import React, { useCallback, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import GuestPassShareCard from '../components/GuestPassShareCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRotatingCode } from '../hooks/useRotatingCode';
import { createCredential } from '../services/accessService';
import { copy } from '../copy';

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const formatTime = (date: Date) => date.toISOString().slice(11, 16);

const GuestsPage: React.FC = () => {
  const { user } = useAuth();
  const { credential } = useRotatingCode({ user });
  const { showToast } = useToast();

  const formRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const initialTimes = useMemo(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    return {
      startDate: formatDate(now),
      startTime: formatTime(now),
      endDate: formatDate(later),
      endTime: formatTime(later),
    };
  }, []);

  const [guestName, setGuestName] = useState('');
  const [startDate, setStartDate] = useState(initialTimes.startDate);
  const [startTime, setStartTime] = useState(initialTimes.startTime);
  const [endDate, setEndDate] = useState(initialTimes.endDate);
  const [endTime, setEndTime] = useState(initialTimes.endTime);
  const [guestLink, setGuestLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const canCreateGuest = credential?.credentialType === 'member' || credential?.credentialType === 'resident';

  const subtitle = useMemo(() => {
    if (!canCreateGuest) return 'Guest passes are available for residents and members.';
    return copy.guests.subtitle;
  }, [canCreateGuest]);

  const startIso = `${startDate}T${startTime}`;
  const endIso = `${endDate}T${endTime}`;

  const handleCreate = useCallback(async () => {
    if (!canCreateGuest) return;
    setError(null);
    setGuestLink(null);

    const fromMs = Date.parse(startIso);
    const toMs = Date.parse(endIso);

    if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
      setError('Unable to parse the selected dates.');
      return;
    }
    if (toMs <= fromMs) {
      setError('End time must come after the start time.');
      return;
    }

    const orgId = credential?.orgId;
    if (!orgId) {
      setError('Credential data is still loading.');
      return;
    }

    setIsCreating(true);
    try {
      if (mode === 'firebase' && user && typeof user.getIdToken === 'function') {
        const idToken = await user.getIdToken();
        const response = await fetch('/.netlify/functions/create-guest-pass', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            guestName: guestName.trim() || undefined,
            validFrom: new Date(fromMs).toISOString(),
            validTo: new Date(toMs).toISOString(),
          }),
        });

        const data = (await response.json()) as { guestUrl?: string; error?: string };
        if (!response.ok || !data.guestUrl) {
          setError(data.error || 'Failed to create guest pass.');
          setIsCreating(false);
          return;
        }

        setGuestLink(data.guestUrl);
        showToast('Guest pass ready. Share the link below.', 'success');
        setIsCreating(false);
        return;
      }

      const result = await createCredential({
        orgId,
        userId: null,
        credentialType: 'guest',
        status: 'active',
        validFrom: new Date(fromMs).toISOString(),
        validTo: new Date(toMs).toISOString(),
        displayName: guestName.trim() || 'Guest',
        memberNo: undefined,
        unitNo: undefined,
      });

      if (!result.success || !result.credentialId) {
        setError(result.error || 'Failed to create guest pass.');
        setIsCreating(false);
        return;
      }

      setGuestLink(`/guest/${result.credentialId}`);
      showToast('Guest pass ready. Share the link below.', 'success');
      setIsCreating(false);
    } catch {
      setError('Network error. Please try again.');
      setIsCreating(false);
    }
  }, [
    canCreateGuest,
    credential,
    endDate,
    endIso,
    endTime,
    guestName,
    mode,
    showToast,
    startDate,
    startIso,
    startTime,
    user,
  ]);

  return (
    <main className="relative min-h-screen overflow-hidden pb-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-8 h-72 w-72 rounded-full bg-action-primary/25 blur-[120px]" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-value-highlight/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-10 sm:px-6">
        <section className="gradient-panel overflow-hidden p-6 sm:p-10">
          <div className="relative space-y-4">
            <p className="kicker">Guest passes</p>
            <div className="flex items-center gap-3">
              <div className="premium-icon">
                <svg className="h-5 w-5 text-text-secondary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 4c4.418 0 8 2.686 8 6v4c0 3.314-3.582 6-8 6s-8-2.686-8-6V10c0-3.314 3.582-6 8-6Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M8 10h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="text-3xl font-display font-bold tracking-tight text-text-primary sm:text-4xl">
                Grant Access
              </h1>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-border-subtle bg-bg-primary px-4 py-2 text-xs font-semibold text-text-secondary shadow-sm">
                <span className="text-[11px] font-medium text-text-secondary">Valid for</span>
                <span className="text-text-primary">{canCreateGuest ? 'Residents & members' : 'Restricted'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-value-highlight/10 px-4 py-2 text-xs font-semibold text-value-highlight shadow-sm">
                <svg className="h-4 w-4 text-value-highlight" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 5l7 7-7 7-7-7 7-7Z" />
                </svg>
                Instant link
              </div>
            </div>
          </div>
        </section>

        <section ref={formRef} className="gradient-panel p-6 sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="kicker">{copy.guests.createCta}</p>
              <h2 className="text-2xl font-display font-black text-text-primary">
                Set a precise welcome window
              </h2>
            </div>
            <span className="premium-icon">
              <svg className="h-5 w-5 text-text-secondary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 6c-3 0-5.5 2-6 5h12c-.5-3-3-5-6-5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2">
                {copy.guests.form.guestNameLabel}
              </label>
              <input
                ref={nameInputRef}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Guest"
                className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:opacity-60"
                disabled={isCreating || !canCreateGuest}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:opacity-60"
                  disabled={isCreating || !canCreateGuest}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">
                  Start time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:opacity-60"
                  disabled={isCreating || !canCreateGuest}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">
                  End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:opacity-60"
                  disabled={isCreating || !canCreateGuest}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">
                  End time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:opacity-60"
                  disabled={isCreating || !canCreateGuest}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-urgency-high bg-urgency-high/10 p-4">
                <p className="text-sm font-semibold text-urgency-high">{error}</p>
              </div>
            )}

            <Button
              variant="primary"
              className="w-full"
              onClick={handleCreate}
              disabled={isCreating || !canCreateGuest}
            >
              {isCreating ? copy.guests.form.submitting : copy.guests.form.submit}
            </Button>
          </div>
        </section>

        {guestLink && (
          <div className="relative mx-auto w-full max-w-3xl">
            <GuestPassShareCard link={guestLink} />
          </div>
        )}
      </div>

    </main>
  );
};

export default GuestsPage;

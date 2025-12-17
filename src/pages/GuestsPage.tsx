import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import CardModal from '../components/CardModal';
import GuestPassShareCard from '../components/GuestPassShareCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRotatingCode } from '../hooks/useRotatingCode';
import { createCredential, getGuestCredentialsByCreatorCredentialId } from '../services/accessService';
import { copy } from '../copy';

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const formatTime = (date: Date) => date.toISOString().slice(11, 16);

type GuestPassSummary = {
  credentialId: string;
  displayName: string;
  validFrom: string;
  validTo: string;
  guestToken?: string | null;
  createdAt?: string;
};

const getGuestPassLink = (pass: GuestPassSummary): string | null => {
  const hasToken = typeof pass.guestToken === 'string' && pass.guestToken.length > 0;
  if (mode === 'firebase' && !hasToken) return null;
  const token = hasToken ? pass.guestToken! : pass.credentialId;
  return `/guest/${token}`;
};

const safeParseMs = (iso: string): number | null => {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
};

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [savedGuestPasses, setSavedGuestPasses] = useState<GuestPassSummary[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const canCreateGuest = credential?.credentialType === 'member' || credential?.credentialType === 'resident';

  const subtitle = useMemo(() => {
    if (!canCreateGuest) return 'Guest passes are available for residents and members.';
    return copy.guests.subtitle;
  }, [canCreateGuest]);

  const startIso = `${startDate}T${startTime}`;
  const endIso = `${endDate}T${endTime}`;

  const creatorCredentialId = credential?.credentialId || null;

  const refreshSaved = useCallback(async () => {
    if (!creatorCredentialId) {
      setSavedGuestPasses([]);
      return;
    }
    const passes = await getGuestCredentialsByCreatorCredentialId(creatorCredentialId);
    const normalized = passes
      .map((p) => ({
        credentialId: p.credentialId,
        displayName: p.displayName,
        validFrom: p.validFrom,
        validTo: p.validTo,
        guestToken: p.guestToken ?? null,
        createdAt: p.createdAt,
      }))
      .sort((a, b) => (Date.parse(b.createdAt || '') || 0) - (Date.parse(a.createdAt || '') || 0));
    setSavedGuestPasses(normalized);
  }, [creatorCredentialId]);

  useEffect(() => {
    void refreshSaved();
  }, [refreshSaved]);

  useEffect(() => {
    if (savedGuestPasses.length === 0) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, [savedGuestPasses.length]);

  const activeGuestPasses = useMemo(() => {
    return savedGuestPasses.filter((pass) => {
      const validToMs = safeParseMs(pass.validTo);
      return validToMs ? validToMs > nowMs : true;
    });
  }, [nowMs, savedGuestPasses]);

  const handleCreate = useCallback(async () => {
    if (!canCreateGuest) return;
    setError(null);
    setGuestLink(null);
    setIsShareModalOpen(false);

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
        setIsShareModalOpen(true);
        showToast('Guest pass ready. Share the link below.', 'success');
        setIsCreating(false);
        void refreshSaved();
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
        createdByUserId: user?.uid ?? null,
        createdByCredentialId: credential?.credentialId ?? null,
        guestToken: undefined,
      });

      if (!result.success || !result.credentialId) {
        setError(result.error || 'Failed to create guest pass.');
        setIsCreating(false);
        return;
      }

      setGuestLink(`/guest/${result.credentialId}`);
      setIsShareModalOpen(true);
      showToast('Guest pass ready. Share the link below.', 'success');
      setIsCreating(false);
      void refreshSaved();
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
    refreshSaved,
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
              <h1 className="text-3xl font-display font-bold tracking-tight text-text-primary sm:text-4xl">Guest link</h1>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{subtitle}</p>
          </div>
        </section>

        <section ref={formRef} className="gradient-panel p-6 sm:p-10">
          <h2 className="text-xl font-display font-black text-text-primary">{copy.guests.createCta}</h2>

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
                  From date
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
                  From time
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
                  To date
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
                  To time
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

        {activeGuestPasses.length > 0 && (
          <section className="relative mx-auto mt-8 w-full max-w-3xl">
            <div className="flex items-end justify-between gap-4 px-2">
              <div>
                <p className="kicker">Saved</p>
                <h2 className="text-lg font-semibold text-text-primary">Your guest passes</h2>
              </div>
              <button
                type="button"
                onClick={() => void refreshSaved()}
                className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {activeGuestPasses.map((pass) => (
                <div key={pass.credentialId} className="gradient-panel p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-text-primary truncate">{pass.displayName || 'Guest'}</div>
                      <div className="mt-1 text-sm text-text-secondary">
                        Valid until{' '}
                        <span className="font-semibold text-text-primary">
                          {new Date(pass.validTo).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {(() => {
                      const link = getGuestPassLink(pass);
                      return (
                    <Button
                      variant="secondary"
                      disabled={!link}
                      onClick={() => {
                        if (!link) return;
                        setGuestLink(link);
                        setIsShareModalOpen(true);
                      }}
                      className="shrink-0"
                    >
                      {link ? 'Share' : 'Unavailable'}
                    </Button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <CardModal
        isOpen={isShareModalOpen && !!guestLink}
        onClose={() => {
          setIsShareModalOpen(false);
          setGuestLink(null);
        }}
        variant="guest"
        maxWidth="md"
        zIndex={60}
      >
        {guestLink && (
          <div className="w-full max-w-md">
            <GuestPassShareCard link={guestLink} />
          </div>
        )}
      </CardModal>
    </main>
  );
};

export default GuestsPage;

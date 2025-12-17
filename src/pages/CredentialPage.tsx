import React, { useMemo } from 'react';
import { useRotatingCode } from '../hooks/useRotatingCode';
import { useAuth } from '../context/AuthContext';
import CredentialCard from '../components/CredentialCard';
import { copy } from '../copy';

const EXPIRING_SOON_DAYS = 7;

const computeStatus = (credential: { status: string; credentialType: string; validFrom: string; validTo: string }) => {
  const now = Date.now();
  const validFromMs = Date.parse(credential.validFrom);
  const validToMs = Date.parse(credential.validTo);

  if (credential.status !== 'active') return { label: copy.credential.status.inactive, tone: 'red' as const };
  if (!Number.isFinite(validFromMs) || !Number.isFinite(validToMs)) return { label: copy.credential.status.invalid, tone: 'red' as const };
  if (now < validFromMs) return { label: copy.credential.status.notYetValid, tone: 'yellow' as const };
  if (now > validToMs) return { label: copy.credential.status.expired, tone: 'red' as const };
  if (credential.credentialType === 'guest') return { label: copy.credential.status.guest, tone: 'yellow' as const };

  const expiringSoonMs = EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000;
  if (validToMs - now <= expiringSoonMs) return { label: copy.credential.status.expiringSoon, tone: 'yellow' as const };
  return { label: copy.credential.status.active, tone: 'green' as const };
};

const CredentialPage: React.FC = () => {
  const { user, userPhotoURL } = useAuth();
  const { isLoading, error, code, secondsRemaining, rotationSeconds, credential } = useRotatingCode({ user });

  const status = useMemo(() => {
    if (!credential) return null;
    return computeStatus(credential);
  }, [credential]);

  const tierLabel = useMemo(() => {
    const type = String(credential?.credentialType || '').toLowerCase();
    if (type === 'resident') return 'Resident';
    if (type === 'member') return 'Member';
    if (type === 'staff') return 'Staff';
    if (type === 'guest') return 'Guest';
    return null;
  }, [credential?.credentialType]);

  return (
    <main className="relative bg-bg-primary overflow-hidden">
      <h1 className="sr-only">{copy.nav.credential}</h1>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-action-primary opacity-[0.08] blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-value-highlight opacity-[0.10] blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-10">
        {error && (
          <div className="rounded-2xl border border-urgency-high bg-urgency-high/10 p-4 mb-5">
            <p className="text-sm font-semibold text-urgency-high">{error}</p>
          </div>
        )}

        <CredentialCard
          status={{ label: status?.label || '—', tone: status?.tone || 'neutral' }}
          code={code}
          isLoading={isLoading}
          secondsRemaining={secondsRemaining}
          rotationSeconds={rotationSeconds}
          displayName={credential?.displayName || user?.displayName || '—'}
          photoUrl={userPhotoURL}
          tierLabel={tierLabel}
          memberOrUnit={credential?.memberNo || credential?.unitNo || null}
          validFrom={credential?.validFrom || null}
          validTo={credential?.validTo || null}
          lastVerifiedAt={null}
          variant="member"
          layout="membership"
          className="mx-auto max-w-md"
        />

        <div className="mt-6 rounded-3xl border border-border-subtle bg-bg-card p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border-subtle bg-bg-primary text-text-secondary">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path d="M12 10v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="7" r="1" fill="currentColor" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="kicker">Quick tips</div>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Show the QR code to staff (or use the 4‑digit backup). Codes rotate every {rotationSeconds ?? 30}s.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CredentialPage;

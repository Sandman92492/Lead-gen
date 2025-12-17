import React, { useMemo } from 'react';
import { useRotatingCode } from '../hooks/useRotatingCode';
import CredentialCard from '../components/CredentialCard';
import { copy } from '../copy';

type GuestCredentialPageProps = {
  token: string;
};

const GuestCredentialPage: React.FC<GuestCredentialPageProps> = ({ token }) => {
  const { isLoading, error, code, secondsRemaining, rotationSeconds, credential } = useRotatingCode({ guestToken: token });

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

  return (
    <main className="relative min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-yellow opacity-[0.10] blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-action-primary opacity-[0.10] blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-black text-text-primary">{copy.credential.guestTitle}</h1>
          <p className="text-text-secondary mt-1">{copy.credential.subtitle}</p>
        </div>

        {error && (
          <div className="bg-urgency-high/10 border border-urgency-high rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-urgency-high">{error}</p>
          </div>
        )}

        <CredentialCard
          status={{ label: tone === 'red' ? copy.credential.status.expired : copy.credential.status.active, tone: tone === 'red' ? 'red' : 'yellow' }}
          code={code}
          isLoading={isLoading}
          secondsRemaining={secondsRemaining}
          rotationSeconds={rotationSeconds}
          displayName={credential?.displayName || 'Guest'}
          tierLabel="Guest"
          memberOrUnit={null}
          validFrom={credential?.validFrom || null}
          validTo={credential?.validTo || null}
          lastVerifiedAt={null}
          variant="guest"
        />

        <p className="text-center text-xs text-text-secondary mt-4">
          This pass expires automatically after its valid window.
        </p>
      </div>
    </main>
  );
};

export default GuestCredentialPage;

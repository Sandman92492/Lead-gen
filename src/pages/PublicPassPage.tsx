import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import PublicBrandHeader from '../components/PublicBrandHeader';
import { useToast } from '../context/ToastContext';
import type { PublicPass } from '../types/leadWallet';
import { getPublicPassByLeadId } from '../services/leadWallet';
import { buildWaMeLink } from '../utils/whatsapp';

const formatDate = (date: Date): string =>
  date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const PublicPassPage: React.FC<{ leadId: string }> = ({ leadId }) => {
  const { showToast } = useToast();
  const [pass, setPass] = useState<PublicPass | null | undefined>(undefined);

  useEffect(() => {
    if (!leadId) return;
    let mounted = true;
    void (async () => {
      try {
        const next = await getPublicPassByLeadId(leadId);
        if (!mounted) return;
        setPass(next);
      } catch {
        if (!mounted) return;
        setPass(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [leadId]);

  const validUntil = useMemo(() => {
    if (!pass?.validUntil?.toDate) return null;
    try {
      return pass.validUntil.toDate();
    } catch {
      return null;
    }
  }, [pass?.validUntil]);

  const whatsappLink = useMemo(() => {
    if (!pass) return null;
    const message = pass.firstName
      ? `Hi, I’m ${pass.firstName}. I’d like to book my Benefit Pass: ${pass.offerTitle}.`
      : `Hi, I’d like to book my Benefit Pass: ${pass.offerTitle}.`;
    return buildWaMeLink(pass.whatsappNumber, message);
  }, [pass]);

  if (!leadId) {
    return (
      <main className="min-h-screen bg-bg-primary px-4 py-10">
        <div className="mx-auto w-full max-w-md rounded-[28px] border border-border-subtle bg-bg-card p-6 text-sm text-text-secondary">
          Missing pass ID.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-5">
        {pass && <PublicBrandHeader businessName={pass.businessName} logoUrl={pass.logoUrl} />}

        {pass === undefined && (
          <div className="rounded-[28px] border border-border-subtle bg-bg-card p-6 text-sm text-text-secondary">Loading…</div>
        )}

        {pass === null && (
          <div className="rounded-[28px] border border-border-subtle bg-bg-card p-6 text-sm text-text-secondary">
            This Benefit Pass is no longer available.
          </div>
        )}

        {pass && (
          <section className="rounded-[32px] border border-border-subtle bg-bg-card p-6 shadow-[0_24px_60px_rgba(11,23,42,0.12)]">
            <div className="rounded-[28px] border border-border-subtle bg-bg-primary p-6 text-center">
              <div className="text-xs font-semibold text-text-secondary">Benefit Pass</div>
              <div className="mt-2 text-2xl font-display font-black text-text-primary">{pass.offerTitle}</div>
              <div className="mt-3 text-sm text-text-secondary">
                Valid until <span className="font-semibold text-text-primary">{validUntil ? formatDate(validUntil) : '—'}</span>
              </div>
            </div>

            <div className="mt-5">
              <Button
                variant="whatsapp"
                className="w-full gap-2"
                onClick={() => {
                  if (!whatsappLink) return;
                  window.open(whatsappLink, '_blank', 'noopener,noreferrer');
                }}
              >
                Book on WhatsApp
              </Button>
            </div>

            {pass.whatsappNumber && (
              <div className="mt-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(pass.whatsappNumber);
                      showToast('Number copied', 'success');
                    } catch {
                      showToast('Copy failed', 'error');
                    }
                  }}
                >
                  Copy number
                </Button>
              </div>
            )}

            <div className="mt-6">
              <div className="text-xs font-semibold text-text-secondary">What happens next</div>
              <ul className="mt-3 space-y-2">
                {pass.offerBullets.map((b, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-text-primary">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-accent/70" aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 text-center text-xs text-text-secondary">
              {pass.campaignName ? (
                <>
                  Campaign: <span className="font-semibold text-text-primary">{pass.campaignName}</span>
                </>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default PublicPassPage;

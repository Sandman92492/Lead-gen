import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UrlQrCode from '../components/UrlQrCode';
import { useToast } from '../context/ToastContext';
import { subscribeCampaigns } from '../services/leadWallet';
import type { Campaign } from '../types/leadWallet';
import EmptyState from '../components/ui/EmptyState';
import BottomSheet from '../components/ui/BottomSheet';
import Section from '../components/ui/Section';
import Row from '../components/ui/Row';
import IconButton from '../components/ui/IconButton';
import Chip from '../components/ui/Chip';
import { downloadDataUrl } from '../utils/download';
import { buildWhatsAppShareLink } from '../utils/whatsapp';
import { getDisplayLink, getShareUrl } from '../utils/links';
import { useAppSettings } from '../hooks/useAppSettings';

const PRIMARY_CAMPAIGN_KEY = 'leadwallet_primary_campaign_v1';

import { motion } from 'framer-motion';

const QrPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings } = useAppSettings();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string>(() => localStorage.getItem(PRIMARY_CAMPAIGN_KEY) || '');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeCampaigns((next) => setCampaigns(next));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedId && campaigns.some((c) => c.id === selectedId)) return;
    if (campaigns[0]?.id) setSelectedId(campaigns[0].id);
  }, [campaigns, selectedId]);

  useEffect(() => {
    try {
      if (selectedId) localStorage.setItem(PRIMARY_CAMPAIGN_KEY, selectedId);
    } catch {
      // ignore
    }
  }, [selectedId]);

  const selected = useMemo(() => campaigns.find((c) => c.id === selectedId) || null, [campaigns, selectedId]);
  const url = useMemo(() => {
    if (!selected) return null;
    if (typeof window === 'undefined') return getShareUrl({ origin: '', slug: selected.slug });
    return getShareUrl({ origin: window.location.origin, slug: selected.slug });
  }, [selected]);
  const displayLink = useMemo(() => {
    if (!selected) return null;
    return getDisplayLink({ slug: selected.slug, mode: settings.linkDisplayMode, brandedPrefix: settings.brandedPrefix });
  }, [selected, settings.brandedPrefix, settings.linkDisplayMode]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="lw-page-container"
    >
      <div className="space-y-4">
        <Section padding="sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[16px] leading-6 font-semibold text-text-primary">Print-ready QR</div>
              <div className="mt-1 text-[13px] leading-5 text-text-secondary">Pick a campaign, then share or download.</div>
            </div>

            <div className="min-w-[11rem]">
              <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Campaign</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full h-11 rounded-[12px] border border-border-subtle bg-bg-primary px-3 text-[13px] font-semibold text-text-primary focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
              >
                {campaigns.length === 0 && <option value="">No campaigns</option>}
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {!selected || !url ? (
          <EmptyState
            title="No campaign selected"
            description="Create a campaign first to generate a QR."
            actionLabel="Create campaign"
            onAction={() => navigate('/campaigns', { state: { openCreate: true } })}
          />
        ) : (
          <Section padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[12px] leading-4 font-semibold text-text-secondary">Campaign</div>
                <div className="mt-1 text-[16px] leading-6 font-semibold text-text-primary truncate">{selected.name}</div>
                <div className="mt-1 text-[13px] leading-5 font-semibold text-text-primary">{settings.offerTitle}</div>
                {displayLink && (
                  <div className="mt-2">
                    <Chip variant="muted">{displayLink}</Chip>
                  </div>
                )}
              </div>

              <IconButton
                variant="secondary"
                aria-label="Actions"
                onClick={() => setActionsOpen(true)}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <div className="rounded-[16px] border border-border-subtle bg-white p-5">
                <UrlQrCode value={url} sizePx={160} onDataUrl={setQrDataUrl} />
              </div>
              <div className="mt-3 text-[12px] leading-4 font-medium text-text-secondary">Scan to claim the offer</div>
            </div>
          </Section>
        )}
      </div>

      <BottomSheet isOpen={actionsOpen} onClose={() => setActionsOpen(false)} title="Share & download">
        {!selected || !url ? null : (
          <Section padded={false}>
            <Row
              title="Share WhatsApp"
              subtitle="Send the link directly to a prospect."
              className="bg-whatsapp/10"
              showChevron
              icon={
                <svg className="h-5 w-5 text-whatsapp" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3a9 9 0 0 0-9 9c0 1.3.3 2.5.8 3.6L3 21l5.4-1.4A9.02 9.02 0 0 0 21 12c0-5-4-9-9-9Z" />
                  <path
                    d="M16.5 14.5c-.2.6-1.2 1.4-2 1.1-.4-.2-.8-.3-1.1-.6-.2-.2-.4-.5-.6-.7-.2-.3-.4-.3-.7-.2-.4.1-.9.3-1.4.2-.4-.1-.7-.5-1-1s-.6-1.7-.9-2.3c-.3-.6-.1-.9.1-1.1.2-.2.4-.5.6-.8.2-.3.3-.4.4-.7.1-.3 0-.5-.1-.6-.1-.2-.9-2.3-1.2-2.5-.3-.2-.6-.2-.9-.2-.3 0-.6 0-.9 0-.3 0-.7.2-.9.6-.1.4-.5 1.1-.5 2s.6 1.9.7 2.1c.2.3.3.7.7 1.2.4.5 1.1 1.2 2.2 1.9.8.5 1.3.7 1.9.7.6 0 1.3-.3 1.6-.6.3-.3.6-.5.9-.4.3 0 .8.2 1.1.5.2.3.2.7.1.9Z"
                    fill="#ffffff"
                  />
                </svg>
              }
              onClick={() => {
                window.open(buildWhatsAppShareLink(url), '_blank', 'noopener,noreferrer');
                setActionsOpen(false);
              }}
            />

            <Row
              title="Copy link"
              subtitle="Paste it anywhere (DM, email, bio)."
              showChevron
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 7h10v14H9V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path
                    d="M5 17H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              }
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  showToast('Link copied', 'success');
                  setActionsOpen(false);
                } catch {
                  showToast('Copy failed', 'error');
                }
              }}
            />

            <Row
              title="Download PNG"
              subtitle={qrDataUrl ? 'Save a print-ready QR image.' : 'Generating QR…'}
              showChevron
              divider={false}
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3v10m0 0l4-4m-4 4-4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
              onClick={() => {
                if (!qrDataUrl || !selected) {
                  showToast('Generating QR…', 'info');
                  return;
                }
                downloadDataUrl(qrDataUrl, `${selected.slug}.png`);
                showToast('QR downloaded', 'success');
                setActionsOpen(false);
              }}
            />
          </Section>
        )}
      </BottomSheet>
    </motion.main>
  );
};

export default QrPage;

import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { createCampaign } from '../services/leadWallet';
import type { CampaignSourceType } from '../types/leadWallet';
import { downloadDataUrl } from '../utils/download';
import { slugify } from '../utils/slug';
import { buildWhatsAppShareLink } from '../utils/whatsapp';
import { getDisplayLink, getShareUrl } from '../utils/links';
import BaseModal from './BaseModal';
import Button from './Button';
import UrlQrCode from './UrlQrCode';
import { useAppSettings } from '../hooks/useAppSettings';

const SOURCE_TYPES: CampaignSourceType[] = [
  'Vehicle',
  'Flyer',
  'Expo',
  'Website',
  'GoogleBusiness',
  'Facebook',
  'Instagram',
  'Referral',
  'WhatsApp',
  'Other',
];

type CreatedCampaign = {
  campaignId: string;
  name: string;
  sourceType: CampaignSourceType;
  slug: string;
};

const CampaignWizardModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const { settings } = useAppSettings();

  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState<CampaignSourceType>('Vehicle');
  const [isCreating, setIsCreating] = useState(false);

  const [created, setCreated] = useState<CreatedCampaign | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setSourceType('Vehicle');
    setIsCreating(false);
    setCreated(null);
    setQrDataUrl(null);
  }, [isOpen]);

  const canCreate = useMemo(() => name.trim().length >= 2 && !isCreating, [isCreating, name]);

  const draftSlug = useMemo(() => slugify(name), [name]);
  const draftUrl = useMemo(() => {
    if (!draftSlug) return '';
    return getDisplayLink({ slug: draftSlug, mode: settings.linkDisplayMode, brandedPrefix: settings.brandedPrefix });
  }, [draftSlug, settings.brandedPrefix, settings.linkDisplayMode]);

  const liveUrl = useMemo(() => {
    if (!created) return '';
    if (typeof window === 'undefined') return getShareUrl({ origin: '', slug: created.slug });
    return getShareUrl({ origin: window.location.origin, slug: created.slug });
  }, [created]);
  const livePretty = useMemo(() => {
    if (!created) return '';
    return getDisplayLink({ slug: created.slug, mode: settings.linkDisplayMode, brandedPrefix: settings.brandedPrefix });
  }, [created, settings.brandedPrefix, settings.linkDisplayMode]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={created ? 'Campaign ready' : 'Create campaign'}
      maxWidth="lg"
      panelClassName="bg-bg-card"
    >
      {!created ? (
        <div className="space-y-5">
          <div>
            <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Campaign name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vehicle QR, Flyer Drop, Expo…"
              className="w-full h-12 rounded-[14px] border border-border-subtle bg-bg-primary px-4 text-[13px] font-medium text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Source type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as CampaignSourceType)}
                className="w-full h-12 rounded-[14px] border border-border-subtle bg-bg-primary px-4 text-[13px] font-semibold text-text-primary focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Link preview</label>
              <div className="w-full rounded-[14px] border border-border-subtle bg-bg-primary px-4 py-3 text-[12px] leading-4 font-semibold text-text-secondary break-all">
                {draftUrl || 'Enter a campaign name…'}
              </div>
              <div className="mt-1 text-[11px] text-text-secondary">
                The final link is confirmed after creation (unique slug).
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={!canCreate}
            onClick={async () => {
              if (!canCreate) return;
              setIsCreating(true);
              try {
                const result = await createCampaign({ name: name.trim(), sourceType });
                setCreated({ campaignId: result.campaignId, slug: result.slug, name: name.trim(), sourceType });
                showToast('Campaign created', 'success');
              } catch {
                showToast('Failed to create campaign', 'error');
              } finally {
                setIsCreating(false);
              }
            }}
          >
            {isCreating ? 'Creating…' : 'Create campaign'}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-[18px] border border-border-subtle bg-bg-primary px-4 py-3">
            <div className="text-[12px] leading-4 font-medium text-text-secondary">Public link</div>
            <div className="mt-1 text-[13px] leading-5 font-semibold text-text-primary break-all">{livePretty}</div>
          </div>

          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-start">
            <div className="flex flex-col items-center">
              <div className="rounded-[22px] border border-border-subtle bg-white p-4 shadow-[var(--shadow-card)]">
                <UrlQrCode value={liveUrl} sizePx={260} onDataUrl={setQrDataUrl} />
              </div>
              <div className="mt-3 text-[12px] leading-4 font-medium text-text-secondary">Scan to claim the offer</div>
            </div>

            <div className="space-y-3">
              <Button
                variant="whatsapp"
                className="w-full"
                onClick={() => {
                  const text = `Claim the offer: ${liveUrl}`;
                  window.open(buildWhatsAppShareLink(text), '_blank', 'noopener,noreferrer');
                }}
              >
                Share WhatsApp
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(liveUrl);
                    showToast('Link copied', 'success');
                  } catch {
                    showToast('Copy failed', 'error');
                  }
                }}
              >
                Copy link
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                disabled={!qrDataUrl}
                onClick={() => {
                  if (!qrDataUrl) return;
                  downloadDataUrl(qrDataUrl, `${created.slug}.png`);
                  showToast('QR downloaded', 'success');
                }}
              >
                Download QR
              </Button>

              <Button variant="secondary" className="w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
};

export default CampaignWizardModal;

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

import { motion, AnimatePresence } from 'framer-motion';

import {
  TruckIcon,
  FileTextIcon,
  BuildingIcon,
  GlobeIcon,
  PinIcon,
  UsersIcon,
  SmartphoneIcon,
  WhatsAppIcon,
  RocketIcon
} from './ui/Icons';

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

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  Vehicle: <TruckIcon className="w-5 h-5 text-action-primary" />,
  Flyer: <FileTextIcon className="w-5 h-5 text-action-primary" />,
  Expo: <BuildingIcon className="w-5 h-5 text-action-primary" />,
  Website: <GlobeIcon className="w-5 h-5 text-action-primary" />,
  GoogleBusiness: <PinIcon className="w-5 h-5 text-action-primary" />,
  Facebook: <UsersIcon className="w-5 h-5 text-action-primary" />,
  Instagram: <SmartphoneIcon className="w-5 h-5 text-action-primary" />,
  Referral: <UsersIcon className="w-5 h-5 text-action-primary" />,
  WhatsApp: <WhatsAppIcon className="w-5 h-5 text-action-primary" />,
  Other: <RocketIcon className="w-5 h-5 text-action-primary" />,
};

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
      title={created ? 'Campaign Activated' : 'Launch Campaign'}
      maxWidth="lg"
    >
      <AnimatePresence mode="wait">
        {!created ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
              <h2 className="text-sm font-black uppercase tracking-widest text-text-primary italic px-1 py-1">Launch New Source</h2>
              <div className="w-12" /> {/* spacer */}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary ml-1">Name</label>
                <div className="relative group">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vehicle QR"
                    className="w-full h-16 rounded-[var(--r-lg)] border-2 border-slate-900 bg-bg-card px-6 text-lg font-black text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:ring-4 focus:ring-action-primary/10 transition-all font-mono italic"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary ml-1">Type</label>
                <div className="relative group/select">
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as CampaignSourceType)}
                    className="w-full h-16 appearance-none rounded-[var(--r-lg)] border-2 border-slate-900 bg-bg-card pl-14 pr-12 text-lg font-black text-text-primary focus:outline-none focus:ring-4 focus:ring-action-primary/10 transition-all cursor-pointer"
                  >
                    {SOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {SOURCE_ICONS[sourceType]}
                  </div>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-primary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary ml-1">Link preview</label>
                <div className="w-full min-h-[64px] flex items-center rounded-[var(--r-lg)] border-2 border-dashed border-slate-200 bg-bg-primary/50 px-6 py-4 text-sm font-black text-text-secondary/60 break-all font-mono italic">
                  {draftUrl || 'Enter a name...'}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full h-16 mt-8 rounded-[var(--r-lg)] text-xl font-black shadow-xl shadow-action-primary/20 hover:scale-[1.02] active:scale-[0.98]"
              disabled={!canCreate}
              onClick={async () => {
                if (!canCreate) return;
                setIsCreating(true);
                try {
                  const result = await createCampaign({ name: name.trim(), sourceType });
                  setCreated({ campaignId: result.campaignId, slug: result.slug, name: name.trim(), sourceType });
                  showToast('Campaign launched!', 'success');
                } catch {
                  showToast('Failed to create campaign', 'error');
                } finally {
                  setIsCreating(false);
                }
              }}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : 'Create Campaign'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="relative group flex flex-col items-center">
              <motion.div
                initial={{ rotate: -5, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="p-8 bg-white rounded-[40px] shadow-2xl border-[3px] border-slate-900 group-hover:shadow-action-primary/20 transition-all mb-4"
              >
                <UrlQrCode value={liveUrl} sizePx={160} onDataUrl={setQrDataUrl} />
              </motion.div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic px-1 py-1 -ml-1">Tracking Active</h3>
                <p className="text-xs font-bold text-text-secondary opacity-60">Scan to claim the {settings?.offerTitle || 'offer'}</p>
              </div>
            </div>

            <div className="rounded-[var(--r-xl)] border-2 border-dashed border-border-subtle bg-bg-primary/50 p-4">
              <div className="text-[10px] font-black tracking-widest text-text-secondary/60 uppercase mb-1">Public Hub Link</div>
              <div className="text-sm font-black text-action-primary underline break-all font-mono">{livePretty}</div>
            </div>

            <div className="space-y-3">
              <Button
                variant="whatsapp"
                className="w-full h-14 text-lg font-black"
                onClick={() => {
                  const offer = settings.offerTitle?.trim() ? settings.offerTitle.trim() : 'offer';
                  const biz = settings.businessName?.trim() ? settings.businessName.trim() : '';
                  const intro = biz ? `${biz}: ` : '';
                  const text = `${intro}Claim the ${offer}: ${liveUrl}`;
                  window.open(buildWhatsAppShareLink(text), '_blank', 'noopener,noreferrer');
                }}
              >
                Share on WhatsApp
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  className="h-12 font-bold"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(liveUrl);
                      showToast('Link copied', 'success');
                    } catch {
                      showToast('Copy failed', 'error');
                    }
                  }}
                >
                  Copy Link
                </Button>

                <Button
                  variant="secondary"
                  className="h-12 font-bold"
                  disabled={!qrDataUrl || !created}
                  onClick={() => {
                    if (!qrDataUrl || !created) return;
                    downloadDataUrl(qrDataUrl, `${created.slug}.png`);
                    showToast('QR downloaded', 'success');
                  }}
                >
                  Save QR
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full h-12 font-black border-none uppercase tracking-widest text-xs opacity-40 hover:opacity-100"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BaseModal >
  );
};

export default CampaignWizardModal;

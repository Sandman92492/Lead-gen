
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UrlQrCode from '../components/UrlQrCode';
import { useToast } from '../context/ToastContext';
import { getCampaignById, deleteCampaign } from '../services/leadWallet';
import type { Campaign } from '../types/leadWallet';
import Card from '../components/ui/Card';
import BottomSheet from '../components/ui/BottomSheet';
import { downloadDataUrl } from '../utils/download';
import { buildWhatsAppShareLink } from '../utils/whatsapp';
import { getDisplayLink, getShareUrl } from '../utils/links';
import { useAppSettings } from '../hooks/useAppSettings';

import { motion } from 'framer-motion';

const CampaignDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { campaignId } = useParams();
  const { settings } = useAppSettings();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    let mounted = true;
    void (async () => {
      try {
        const c = await getCampaignById(campaignId);
        if (mounted) setCampaign(c);
      } catch {
        if (mounted) setCampaign(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [campaignId]);

  const campaignUrl = useMemo(() => {
    if (!campaign) return null;
    if (typeof window === 'undefined') return getShareUrl({ origin: '', slug: campaign.slug });
    return getShareUrl({ origin: window.location.origin, slug: campaign.slug });
  }, [campaign]);
  const displayLink = useMemo(() => {
    if (!campaign) return null;
    return getDisplayLink({ slug: campaign.slug, mode: settings.linkDisplayMode, brandedPrefix: settings.brandedPrefix });
  }, [campaign, settings.brandedPrefix, settings.linkDisplayMode]);

  if (!campaignId) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-32 sm:px-6">
        <Card className="p-5">
          <div className="text-[15px] leading-6 font-semibold text-text-primary">Missing campaign ID</div>
          <div className="mt-2 text-[13px] leading-5 text-text-secondary">Go back and open a campaign again.</div>
        </Card>
      </main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="lw-page-container max-w-2xl mx-auto px-4 pt-6 pb-32"
    >
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
          >
            <div className="h-8 w-8 rounded-full border border-border-subtle bg-bg-card flex items-center justify-center group-hover:bg-bg-primary transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            Back
          </button>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Delete this campaign? This cannot be undone.')) {
                await deleteCampaign(campaignId!);
                navigate('/campaigns');
              }
            }}
            className="ml-4 group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors"
          >
            Delete
          </button>
        </div>

        {campaign === undefined && (
          <div className="p-12 text-center text-text-secondary animate-pulse font-bold">Loading campaign details…</div>
        )}

        {campaign === null && (
          <div className="rounded-[32px] border-2 border-slate-900 bg-white p-8 text-center shadow-xl">
            <div className="text-xl font-black text-text-primary uppercase tracking-tight italic">Campaign not found</div>
            <div className="mt-2 text-sm font-bold text-text-secondary">This campaign may have been removed.</div>
          </div>
        )}

        {campaign && campaignUrl && (
          <div className="space-y-4">
            {/* Top Card: Status & Link (Sketch Image 3) */}
            <div className="rounded-[32px] border-2 border-slate-900 bg-white p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic truncate px-1 py-1 -ml-1">
                    {campaign.name}
                  </h1>
                </div>
                <div className="shrink-0 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-[10px] font-black text-success tracking-widest uppercase">
                  LIVE
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-bg-primary/50 p-5 font-mono text-sm font-black text-text-primary break-all">
                  {displayLink}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(campaignUrl);
                      showToast('Link copied', 'success');
                    } catch {
                      showToast('Copy failed', 'error');
                    }
                  }}
                  className="w-full h-14 rounded-[24px] border-2 border-slate-900 bg-bg-primary flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-text-primary hover:bg-slate-50 transition-colors active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 7h10v14H9V7Z" strokeLinejoin="round" />
                    <path d="M5 17H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" strokeLinecap="round" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>

            {/* Bottom Card: QR & Share (Sketch Image 3) */}
            <div className="rounded-[32px] border-2 border-slate-900 bg-white p-6 shadow-2xl overflow-hidden relative">
              <div className="flex flex-col items-center">
                <div className="p-8 bg-white rounded-[40px] shadow-lg border-[3px] border-slate-900 transition-all mb-4">
                  <UrlQrCode value={campaignUrl} sizePx={160} onDataUrl={setQrDataUrl} />
                </div>

                <div className="text-center space-y-1 mb-8">
                  <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic">Campaign Details</h3>
                  <p className="text-xs font-bold text-text-secondary opacity-60">Scan to claim the {settings?.offerTitle || 'offer'}</p>
                </div>

                <div className="w-full space-y-3">
                  <button
                    onClick={() => setShareOpen(true)}
                    className="w-full h-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center gap-2 text-xl font-black uppercase tracking-tight shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-transform"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M16 8a3 3 0 1 0-2.83-4H13a3 3 0 0 0 3 4ZM6 14a3 3 0 1 0 2.83 4H9a3 3 0 0 0-3-4Z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8.7 16.6l6.6-3.2M15.3 10.6L8.7 7.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <BottomSheet isOpen={shareOpen} onClose={() => setShareOpen(false)} title={`Share • ${campaign?.name || ''} `}>
          <div className="space-y-4 pt-2">
            <button
              onClick={() => {
                const text = `Claim the offer: ${campaignUrl} `;
                window.open(buildWhatsAppShareLink(text), '_blank', 'noopener,noreferrer');
                setShareOpen(false);
              }}
              className="w-full group flex items-center gap-4 bg-whatsapp/10 border-2 border-whatsapp/20 rounded-[24px] p-5 text-left transition-all hover:bg-whatsapp/20"
            >
              <div className="h-12 w-12 rounded-2xl bg-whatsapp flex items-center justify-center shrink-0 shadow-lg shadow-whatsapp/20">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 0 0-9 9c0 1.3.3 2.5.8 3.6L3 21l5.4-1.4A9.02 9.02 0 0 0 21 12c0-5-4-9-9-9Z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-lg font-black text-text-primary uppercase tracking-tight">Share WhatsApp</div>
                <div className="text-xs font-bold text-whatsapp/60 uppercase">Send directly to prospect</div>
              </div>
            </button>

            <button
              onClick={() => {
                if (!qrDataUrl) return;
                downloadDataUrl(qrDataUrl, `${campaign?.slug || 'campaign'}.png`);
                showToast('QR downloaded', 'success');
                setShareOpen(false);
              }}
              className="w-full group flex items-center gap-4 bg-bg-primary border border-border-subtle rounded-[24px] p-5 text-left transition-all hover:border-slate-400"
            >
              <div className="h-12 w-12 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 2h2v2h-2v-2Zm4-2h2v2h-2v-2Zm0 4h2v2h-2v-2Zm-4 2h2v2h-2v-2Z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-lg font-black text-text-primary uppercase tracking-tight">Download QR</div>
                <div className="text-xs font-bold text-text-secondary/60 uppercase">Print-ready PNG</div>
              </div>
            </button>
          </div>
        </BottomSheet>
      </div>
    </motion.main>
  );
};

export default CampaignDetailPage;

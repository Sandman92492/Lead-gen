import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CampaignWizardModal from '../components/CampaignWizardModal';
import { useToast } from '../context/ToastContext';
import { getLeadCountByCampaignId, subscribeCampaigns } from '../services/leadWallet';
import type { Campaign, CampaignSourceType } from '../types/leadWallet';
import EmptyState from '../components/ui/EmptyState';
import BottomSheet from '../components/ui/BottomSheet';
import { downloadDataUrl } from '../utils/download';
import { generateQrDataUrl } from '../utils/qr';
import { getShareUrl } from '../utils/links';
import { buildWhatsAppShareLink } from '../utils/whatsapp';
import Section from '../components/ui/Section';
import Row from '../components/ui/Row';
import {
  TruckIcon,
  FileTextIcon,
  GlobeIcon,
  UsersIcon,
  PinIcon,
  BuildingIcon,
  RocketIcon,
  SmartphoneIcon,
  WhatsAppIcon
} from '../components/ui/Icons';

import { motion } from 'framer-motion';

const CampaignsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const [actionCampaign, setActionCampaign] = useState<Campaign | null>(null);

  const getSourceIcon = (type: CampaignSourceType) => {
    switch (type) {
      case 'Vehicle': return <TruckIcon className="text-action-primary" />;
      case 'Flyer': return <FileTextIcon className="text-action-primary" />;
      case 'Expo': return <BuildingIcon className="text-action-primary" />;
      case 'Website': return <GlobeIcon className="text-action-primary" />;
      case 'GoogleBusiness': return <PinIcon className="text-action-primary" />;
      case 'Facebook': return <UsersIcon className="text-action-primary" />;
      case 'Instagram': return <SmartphoneIcon className="text-action-primary" />;
      case 'Referral': return <UsersIcon className="text-action-primary" />;
      case 'WhatsApp': return <WhatsAppIcon className="text-action-primary" />;
      default: return <RocketIcon className="text-action-primary" />;
    }
  };

  useEffect(() => {
    const unsub = subscribeCampaigns((next) => {
      setCampaigns(next);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const nextCounts: Record<string, number> = {};
      await Promise.all(
        campaigns.map(async (c) => {
          try {
            const count = await getLeadCountByCampaignId(c.id);
            nextCounts[c.id] = count;
          } catch {
            nextCounts[c.id] = 0;
          }
        })
      );
      if (mounted) setCounts(nextCounts);
    })();
    return () => {
      mounted = false;
    };
  }, [campaigns]);

  useEffect(() => {
    const wantsCreate = Boolean((location.state as any)?.openCreate);
    if (!wantsCreate) return;
    setWizardOpen(true);
    navigate('/campaigns', { replace: true, state: null });
  }, [location.state, navigate]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="lw-page-container max-w-4xl mx-auto"
    >
      <div className="space-y-6">
        <header className="flex items-center justify-between px-1">
          <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase italic">
            Campaigns
          </h1>
        </header>

        {/* Big Create Button (Sketch Image 1) */}
        <button
          onClick={() => setWizardOpen(true)}
          className="w-full group relative overflow-hidden rounded-[24px] border-2 border-slate-900 bg-bg-card p-6 text-left shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] hover:shadow-action-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xl font-black text-text-primary uppercase tracking-tight">Create Campaign</div>
              <div className="text-xs font-bold text-text-secondary opacity-60 uppercase">Get a new link + QR code instantly</div>
            </div>
            <div className="h-12 w-12 rounded-full border-2 border-slate-900 bg-action-primary flex items-center justify-center text-white transition-transform group-hover:scale-110">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </button>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 w-full rounded-[24px] bg-surface animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && campaigns.length === 0 && (
          <EmptyState
            title="No campaigns yet"
            description="Create your first campaign and start collecting leads."
            actionLabel="Create campaign"
            onAction={() => setWizardOpen(true)}
          />
        )}

        {!isLoading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 gap-4 pb-12">
            {campaigns.map((c, idx) => {
              const leadCount = counts[c.id] || 0;

              return (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="w-full text-left group flex items-center gap-4 bg-bg-card border border-border-subtle rounded-[24px] p-5 shadow-sm hover:shadow-md hover:border-slate-400 transition-all active:scale-[0.98]"
                >
                  <div className="flex-1 flex items-center gap-4" onClick={() => navigate(`/campaigns/${c.id}`)}>
                    <div className="h-14 w-14 rounded-2xl bg-bg-primary border border-border-subtle flex items-center justify-center shrink-0">
                      {getSourceIcon(c.sourceType)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-lg font-black text-text-primary uppercase tracking-tight truncate pr-1 py-1">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border-subtle">
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-[10px] font-black text-white flex items-center justify-center">
                            {leadCount}
                          </div>
                          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">leads</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-10 w-10 flex items-center justify-center text-text-secondary opacity-20 group-hover:opacity-100 group-hover:text-action-primary transition-all">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <BottomSheet
        isOpen={Boolean(actionCampaign)}
        onClose={() => setActionCampaign(null)}
        title={actionCampaign?.name ? `Share • ${actionCampaign.name}` : 'Share'}
      >
        {actionCampaign && (
          <div className="space-y-4">

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
                  const fullUrl =
                    typeof window === 'undefined'
                      ? getShareUrl({ origin: '', slug: actionCampaign.slug })
                      : getShareUrl({ origin: window.location.origin, slug: actionCampaign.slug });
                  const text = `Claim the offer: ${fullUrl}`;
                  window.open(buildWhatsAppShareLink(text), '_blank', 'noopener,noreferrer');
                  setActionCampaign(null);
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
                  const fullUrl =
                    typeof window === 'undefined'
                      ? getShareUrl({ origin: '', slug: actionCampaign.slug })
                      : getShareUrl({ origin: window.location.origin, slug: actionCampaign.slug });
                  try {
                    await navigator.clipboard.writeText(fullUrl);
                    showToast('Link copied', 'success');
                    setActionCampaign(null);
                  } catch {
                    showToast('Copy failed', 'error');
                  }
                }}
              />

              <Row
                title="Download QR PNG"
                subtitle="Use on flyers, posters, or print."
                showChevron
                divider={false}
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 2h2v2h-2v-2Zm4-2h2v2h-2v-2Zm0 4h2v2h-2v-2Zm-4 2h2v2h-2v-2Z" fill="currentColor" />
                  </svg>
                }
                onClick={async () => {
                  if (isDownloading) return;
                  const fullUrl =
                    typeof window === 'undefined'
                      ? getShareUrl({ origin: '', slug: actionCampaign.slug })
                      : getShareUrl({ origin: window.location.origin, slug: actionCampaign.slug });
                  setIsDownloading(actionCampaign.id);
                  try {
                    const dataUrl = await generateQrDataUrl(fullUrl, 360);
                    downloadDataUrl(dataUrl, `${actionCampaign.slug}.png`);
                    showToast('QR downloaded', 'success');
                    setActionCampaign(null);
                  } catch {
                    showToast('Failed to generate QR', 'error');
                  } finally {
                    setIsDownloading(null);
                  }
                }}
              />
            </Section>
          </div>
        )}
      </BottomSheet>

      <CampaignWizardModal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
    </motion.main>
  );
};

export default CampaignsPage;

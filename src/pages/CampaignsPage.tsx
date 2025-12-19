import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CampaignWizardModal from '../components/CampaignWizardModal';
import { useToast } from '../context/ToastContext';
import { getLeadCountByCampaignId, subscribeCampaigns } from '../services/leadWallet';
import type { Campaign } from '../types/leadWallet';
import EmptyState from '../components/ui/EmptyState';
import BottomSheet from '../components/ui/BottomSheet';
import { downloadDataUrl } from '../utils/download';
import { generateQrDataUrl } from '../utils/qr';
import { getDisplayLink, getShareUrl } from '../utils/links';
import { buildWhatsAppShareLink } from '../utils/whatsapp';
import { useAppSettings } from '../hooks/useAppSettings';
import Section from '../components/ui/Section';
import Row from '../components/ui/Row';
import IconButton from '../components/ui/IconButton';
import PrimaryButton from '../components/ui/PrimaryButton';

import { motion } from 'framer-motion';

const CampaignsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings } = useAppSettings();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const [actionCampaign, setActionCampaign] = useState<Campaign | null>(null);
  const [suppressNextClick, setSuppressNextClick] = useState(false);

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
      className="lw-page-container"
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Campaigns
        </h1>

        <Section padded={false}>
          <Row
            title="Create campaign"
            subtitle="2 steps: name + source → get link + QR instantly."
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            }
            divider={false}
            onClick={() => setWizardOpen(true)}
            right={
              <PrimaryButton
                className="h-9 px-4"
                onClick={(e) => {
                  e.stopPropagation();
                  setWizardOpen(true);
                }}
              >
                Create
              </PrimaryButton>
            }
          />
        </Section>

        {isLoading && (
          <Section padding="sm">
            <div className="text-base text-text-secondary">Loading campaigns…</div>
          </Section>
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
          <Section padded={false}>
            {campaigns.map((c, idx) => {
              const leadCount = counts[c.id];
              const busy = isDownloading === c.id;
              const displayLink = getDisplayLink({
                slug: c.slug,
                mode: settings.linkDisplayMode,
                brandedPrefix: settings.brandedPrefix,
              });

              return (
                <div
                  key={c.id}
                  role="presentation"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setActionCampaign(c);
                    setSuppressNextClick(true);
                  }}
                  onPointerDown={(e) => {
                    if (e.pointerType !== 'touch') return;
                    const id = window.setTimeout(() => {
                      setActionCampaign(c);
                      setSuppressNextClick(true);
                    }, 520);
                    (e.currentTarget as any).__lwLongPress = id;
                  }}
                  onPointerUp={(e) => {
                    const id = (e.currentTarget as any).__lwLongPress;
                    if (id) window.clearTimeout(id);
                  }}
                  onPointerCancel={(e) => {
                    const id = (e.currentTarget as any).__lwLongPress;
                    if (id) window.clearTimeout(id);
                  }}
                  onPointerLeave={(e) => {
                    const id = (e.currentTarget as any).__lwLongPress;
                    if (id) window.clearTimeout(id);
                  }}
                >
                  <Row
                    title={c.name}
                    subtitle={`${c.sourceType} • ${typeof leadCount === 'number' ? `${leadCount} leads` : '—'} • ${displayLink}`}
                    divider={idx !== campaigns.length - 1}
                    onClick={() => {
                      if (suppressNextClick) {
                        setSuppressNextClick(false);
                        return;
                      }
                      navigate(`/campaigns/${c.id}`);
                    }}
                    right={
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          variant="secondary"
                          size="md"
                          aria-label="Share"
                          onClick={() => setActionCampaign(c)}
                          disabled={busy}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M16 8a3 3 0 1 0-2.83-4H13a3 3 0 0 0 3 4ZM6 14a3 3 0 1 0 2.83 4H9a3 3 0 0 0-3-4Zm10-2a3 3 0 1 0 2.83 4H19a3 3 0 0 0-3-4Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8.7 16.6l6.6-3.2M15.3 10.6L8.7 7.4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </IconButton>

                        <span className="h-10 w-6 grid place-items-center text-text-secondary" aria-hidden="true">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M10 7l5 5-5 5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    }
                  />
                </div>
              );
            })}
          </Section>
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

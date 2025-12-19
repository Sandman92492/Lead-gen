import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import UrlQrCode from '../components/UrlQrCode';
import { useToast } from '../context/ToastContext';
import { getCampaignById } from '../services/leadWallet';
import type { Campaign } from '../types/leadWallet';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import BottomSheet from '../components/ui/BottomSheet';
import { downloadDataUrl } from '../utils/download';
import { buildWhatsAppShareLink } from '../utils/whatsapp';
import { getDisplayLink, getShareUrl } from '../utils/links';
import { useAppSettings } from '../hooks/useAppSettings';

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
    <main className="mx-auto w-full max-w-4xl px-4 pt-4 pb-32 sm:px-6">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[13px] leading-5 font-medium text-text-secondary hover:text-text-primary"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        {campaign === undefined && (
          <Card className="p-5">
            <div className="text-[13px] leading-5 text-text-secondary">Loading campaign…</div>
          </Card>
        )}

        {campaign === null && (
          <Card className="p-5">
            <div className="text-[15px] leading-6 font-semibold text-text-primary">Campaign not found</div>
            <div className="mt-2 text-[13px] leading-5 text-text-secondary">This campaign may be removed or unavailable.</div>
          </Card>
        )}

        {campaign && campaignUrl && (
          <>
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[18px] leading-6 font-semibold text-text-primary truncate">{campaign.name}</div>
                  <div className="mt-1 text-[13px] leading-5 text-text-secondary">Source: {campaign.sourceType}</div>
                </div>
                <Badge variant="success">LIVE</Badge>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="rounded-[18px] border border-border-subtle bg-bg-primary px-4 py-3 text-[13px] leading-5 font-semibold text-text-primary break-all">
                  {displayLink}
                </div>
                <button
                  type="button"
                  className="h-12 w-12 grid place-items-center rounded-[18px] border border-border-subtle bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-primary focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                  aria-label="Share"
                  onClick={() => setShareOpen(true)}
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
                </button>
              </div>
            </Card>

            {campaign.sourceType === 'Website' && (
              <Card className="p-5">
                <div className="text-[15px] leading-6 font-semibold text-text-primary">Website</div>
                <div className="mt-2 text-[13px] leading-5 text-text-secondary">
                  Use this link on your website’s Contact / Get Quote button.
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="rounded-[18px] border border-border-subtle bg-bg-primary px-4 py-3 text-[13px] leading-5 font-semibold text-text-primary break-all">
                    {displayLink}
                  </div>
                  <button
                    type="button"
                    className="h-12 w-12 grid place-items-center rounded-[18px] border border-border-subtle bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-primary focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                    aria-label="Share"
                    onClick={() => setShareOpen(true)}
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
                  </button>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <div className="flex flex-col items-center">
                <div className="rounded-[22px] border border-border-subtle bg-white p-5 shadow-[var(--shadow-card)]">
                  <UrlQrCode value={campaignUrl} sizePx={320} onDataUrl={setQrDataUrl} />
                </div>
                <div className="mt-3 text-[12px] leading-4 font-medium text-text-secondary">Scan to claim the offer</div>

                <div className="mt-6 w-full">
                  <Button variant="primary" className="w-full" onClick={() => setShareOpen(true)}>
                    Share
                  </Button>
                </div>
              </div>
            </Card>

            <BottomSheet isOpen={shareOpen} onClose={() => setShareOpen(false)} title={`Share • ${campaign.name}`}>
              <div className="space-y-3">
                <div className="text-[13px] leading-5 text-text-secondary">Choose how you want to share this campaign.</div>
                <div className="grid gap-2">
                  <Card
                    padded={false}
                    className="p-4 flex items-start justify-between gap-3 border border-whatsapp/25 bg-whatsapp/10 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      const text = `Claim the offer: ${campaignUrl}`;
                      window.open(buildWhatsAppShareLink(text), '_blank', 'noopener,noreferrer');
                      setShareOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-[16px] bg-whatsapp text-white grid place-items-center shrink-0">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 3a9 9 0 0 0-9 9c0 1.3.3 2.5.8 3.6L3 21l5.4-1.4A9.02 9.02 0 0 0 21 12c0-5-4-9-9-9Z" />
                          <path
                            d="M16.5 14.5c-.2.6-1.2 1.4-2 1.1-.4-.2-.8-.3-1.1-.6-.2-.2-.4-.5-.6-.7-.2-.3-.4-.3-.7-.2-.4.1-.9.3-1.4.2-.4-.1-.7-.5-1-1s-.6-1.7-.9-2.3c-.3-.6-.1-.9.1-1.1.2-.2.4-.5.6-.8.2-.3.3-.4.4-.7.1-.3 0-.5-.1-.6-.1-.2-.9-2.3-1.2-2.5-.3-.2-.6-.2-.9-.2-.3 0-.6 0-.9 0-.3 0-.7.2-.9.6-.1.4-.5 1.1-.5 2s.6 1.9.7 2.1c.2.3.3.7.7 1.2.4.5 1.1 1.2 2.2 1.9.8.5 1.3.7 1.9.7.6 0 1.3-.3 1.6-.6.3-.3.6-.5.9-.4.3 0 .8.2 1.1.5.2.3.2.7.1.9Z"
                            fill="#ffffff"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] leading-6 font-semibold text-text-primary">Share WhatsApp</div>
                        <div className="mt-0.5 text-[13px] leading-5 text-text-secondary">Send the link directly to a prospect.</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-text-secondary">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Card>

                  <Card
                    padded={false}
                    className="p-4 flex items-start justify-between gap-3 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                    role="button"
                    tabIndex={0}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(campaignUrl);
                        showToast('Link copied', 'success');
                        setShareOpen(false);
                      } catch {
                        showToast('Copy failed', 'error');
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-[16px] border border-border-subtle bg-bg-primary text-text-primary grid place-items-center shrink-0">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 7h10v14H9V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          <path
                            d="M5 17H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] leading-6 font-semibold text-text-primary">Copy link</div>
                        <div className="mt-0.5 text-[13px] leading-5 text-text-secondary">Paste it anywhere (DM, email, bio).</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-text-secondary">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Card>

                  <Card
                    padded={false}
                    className="p-4 flex items-start justify-between gap-3 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!qrDataUrl) {
                        showToast('QR not ready yet', 'error');
                        return;
                      }
                      downloadDataUrl(qrDataUrl, `${campaign.slug}.png`);
                      showToast('QR downloaded', 'success');
                      setShareOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-[16px] border border-border-subtle bg-bg-primary text-text-primary grid place-items-center shrink-0">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 2h2v2h-2v-2Zm4-2h2v2h-2v-2Zm0 4h2v2h-2v-2Zm-4 2h2v2h-2v-2Z" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] leading-6 font-semibold text-text-primary">Download QR PNG</div>
                        <div className="mt-0.5 text-[13px] leading-5 text-text-secondary">Use on flyers, posters, or print.</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-text-secondary">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Card>
                </div>
              </div>
            </BottomSheet>
          </>
        )}
      </div>
    </main>
  );
};

export default CampaignDetailPage;

import React, { useState, useMemo } from 'react';
import Button from './Button';
import GuideTip from './ui/GuideTip';
import UrlQrCode from './UrlQrCode';
import { useAppSettings } from '../hooks/useAppSettings';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { saveAppSettings, createCampaign } from '../services/leadWallet';
import { useToast } from '../context/ToastContext';
import { getShareUrl, getDisplayLink } from '../utils/links';
import { buildWhatsAppShareLink } from '../utils/whatsapp';
import { downloadDataUrl } from '../utils/download';
import type { CampaignSourceType } from '../types/leadWallet';
import type { OnboardingStep } from '../types/onboarding';

const SOURCE_TYPES: { id: CampaignSourceType; label: string; icon: string }[] = [
  { id: 'Vehicle', label: 'Vehicle QR', icon: '🚗' },
  { id: 'Flyer', label: 'Flyer / Print', icon: '📄' },
  { id: 'Website', label: 'Website', icon: '🌐' },
  { id: 'Referral', label: 'Referral', icon: '🤝' },
  { id: 'WhatsApp', label: 'WhatsApp', icon: '💬' },
  { id: 'Other', label: 'Other', icon: '📌' },
];

interface SetupWizardProps {
  onComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const { showToast } = useToast();
  const { settings } = useAppSettings();
  const { updateProgress } = useOnboardingProgress();

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState(settings.businessName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '');
  const [offerTitle, setOfferTitle] = useState(settings.offerTitle || 'Free Quote');
  const [bullet1, setBullet1] = useState(settings.offerBullets?.[0] || 'We\'ll call you within 5 minutes');
  const [bullet2, setBullet2] = useState(settings.offerBullets?.[1] || 'Get a no-obligation quote');
  const [bullet3, setBullet3] = useState(settings.offerBullets?.[2] || 'Book at a time that suits you');
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    settings.defaultWhatsappTemplate || 'Hi {name}! Thanks for your enquiry via {campaign}. How can I help you today?'
  );
  const [campaignName, setCampaignName] = useState('');
  const [campaignSource, setCampaignSource] = useState<CampaignSourceType>('Vehicle');
  const [createdCampaign, setCreatedCampaign] = useState<{ slug: string; name: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const liveUrl = useMemo(() => {
    if (!createdCampaign) return '';
    return getShareUrl({ origin: window.location.origin, slug: createdCampaign.slug });
  }, [createdCampaign]);

  const displayUrl = useMemo(() => {
    if (!createdCampaign) return '';
    return getDisplayLink({ slug: createdCampaign.slug, mode: settings.linkDisplayMode, brandedPrefix: settings.brandedPrefix });
  }, [createdCampaign, settings.linkDisplayMode, settings.brandedPrefix]);

  const steps: OnboardingStep[] = ['welcome', 'business', 'offer', 'whatsapp', 'campaign', 'share', 'complete'];
  const currentIndex = steps.indexOf(step);
  const progressPercent = Math.round((currentIndex / (steps.length - 1)) * 100);

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      if (step === 'welcome') {
        setStep('business');
      } else if (step === 'business') {
        await saveAppSettings({ businessName, whatsappNumber });
        await updateProgress({ businessSetupComplete: true });
        setStep('offer');
      } else if (step === 'offer') {
        await saveAppSettings({ offerTitle, offerBullets: [bullet1, bullet2, bullet3] });
        await updateProgress({ offerSetupComplete: true });
        setStep('whatsapp');
      } else if (step === 'whatsapp') {
        await saveAppSettings({ defaultWhatsappTemplate: whatsappTemplate });
        await updateProgress({ whatsappTemplateComplete: true });
        setStep('campaign');
      } else if (step === 'campaign') {
        const result = await createCampaign({ name: campaignName.trim(), sourceType: campaignSource });
        setCreatedCampaign({ slug: result.slug, name: campaignName.trim() });
        await updateProgress({ firstCampaignCreated: true });
        setStep('share');
      } else if (step === 'share') {
        await updateProgress({ firstShareComplete: true });
        setStep('complete');
      } else if (step === 'complete') {
        onComplete();
      }
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = useMemo(() => {
    if (step === 'business') return businessName.trim().length >= 2 && whatsappNumber.trim().length >= 10;
    if (step === 'offer') return offerTitle.trim().length >= 2;
    if (step === 'whatsapp') return whatsappTemplate.trim().length >= 10;
    if (step === 'campaign') return campaignName.trim().length >= 2;
    return true;
  }, [step, businessName, whatsappNumber, offerTitle, whatsappTemplate, campaignName]);

  const inputClass = 'w-full h-12 rounded-[var(--r-md)] border border-border-subtle bg-white px-4 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary transition-colors';
  const textareaClass = 'w-full rounded-[var(--r-md)] border border-border-subtle bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary transition-colors resize-none';
  const labelClass = 'block text-xs font-medium text-text-secondary mb-2';

  return (
    <div className="fixed inset-0 z-40 bg-bg flex flex-col">
      {/* Progress bar */}
      {step !== 'welcome' && step !== 'complete' && (
        <div className="h-1 bg-border-subtle">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-5 py-8">
          {/* Welcome */}
          {step === 'welcome' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-3">
                Get your first lead in 3 minutes
              </h1>
              <p className="text-text-secondary mb-8">
                We'll help you set up everything you need to start capturing and converting leads today.
              </p>
              <div className="space-y-3 text-left mb-8">
                {[
                  { icon: '🏢', text: 'Add your business info' },
                  { icon: '🎁', text: 'Create your offer' },
                  { icon: '💬', text: 'Set up WhatsApp follow-up' },
                  { icon: '📲', text: 'Get your QR code' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-[var(--r-md)]">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium text-text-primary">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Setup */}
          {step === 'business' && (
            <div>
              <h1 className="text-xl font-bold text-text-primary mb-2">Your business</h1>
              <p className="text-sm text-text-secondary mb-6">This appears on your lead capture page.</p>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Business name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Smith Plumbing"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>WhatsApp number</label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 27821234567"
                    className={inputClass}
                  />
                </div>
              </div>

              <GuideTip className="mt-6">
                We'll use this on your lead page and WhatsApp messages.
              </GuideTip>
            </div>
          )}

          {/* Offer Setup */}
          {step === 'offer' && (
            <div>
              <h1 className="text-xl font-bold text-text-primary mb-2">Your offer</h1>
              <p className="text-sm text-text-secondary mb-6">Give people a reason to submit their details.</p>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Offer title</label>
                  <input
                    type="text"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    placeholder="e.g. Free Quote, 10% Off, Free Consultation"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>What happens next (3 bullets)</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={bullet1}
                      onChange={(e) => setBullet1(e.target.value)}
                      placeholder="e.g. We'll call you within 5 minutes"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={bullet2}
                      onChange={(e) => setBullet2(e.target.value)}
                      placeholder="e.g. Get a no-obligation quote"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={bullet3}
                      onChange={(e) => setBullet3(e.target.value)}
                      placeholder="e.g. Book at a time that suits you"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <GuideTip className="mt-6">
                Short is better. 3 bullets max. Tell them exactly what to expect.
              </GuideTip>
            </div>
          )}

          {/* WhatsApp Template */}
          {step === 'whatsapp' && (
            <div>
              <h1 className="text-xl font-bold text-text-primary mb-2">WhatsApp follow-up</h1>
              <p className="text-sm text-text-secondary mb-6">Your instant message when a lead comes in.</p>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Message template</label>
                  <textarea
                    value={whatsappTemplate}
                    onChange={(e) => setWhatsappTemplate(e.target.value)}
                    rows={4}
                    className={textareaClass}
                    placeholder="Hi {name}! Thanks for your enquiry..."
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Variables: <code className="bg-surface px-1 rounded">{'{name}'}</code>{' '}
                    <code className="bg-surface px-1 rounded">{'{campaign}'}</code>{' '}
                    <code className="bg-surface px-1 rounded">{'{suburb}'}</code>
                  </p>
                </div>

                <div className="p-4 bg-[#DCF8C6] rounded-[var(--r-md)] border border-[#25D366]/20">
                  <p className="text-sm text-gray-800">
                    {whatsappTemplate
                      .replace('{name}', 'John')
                      .replace('{campaign}', 'Vehicle QR')
                      .replace('{suburb}', 'Sandton')}
                  </p>
                </div>
              </div>

              <GuideTip className="mt-6">
                Aim for a question that gets a reply. Keep it personal and short.
              </GuideTip>
            </div>
          )}

          {/* Campaign Creation */}
          {step === 'campaign' && (
            <div>
              <h1 className="text-xl font-bold text-text-primary mb-2">Create your first campaign</h1>
              <p className="text-sm text-text-secondary mb-6">This gives you a unique link and QR to share.</p>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Campaign name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Bakkie QR, Website Form"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Where will you use this?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOURCE_TYPES.map((source) => (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => setCampaignSource(source.id)}
                        className={`p-3 rounded-[var(--r-md)] border text-left transition-all ${
                          campaignSource === source.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border-subtle hover:border-primary/50'
                        }`}
                      >
                        <span className="text-lg">{source.icon}</span>
                        <p className="text-sm font-medium text-text-primary mt-1">{source.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <GuideTip className="mt-6">
                Campaigns let you see what's working. Create one for each place you share your link.
              </GuideTip>
            </div>
          )}

          {/* Share */}
          {step === 'share' && createdCampaign && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-text-primary mb-2">Your campaign is ready!</h1>
                <p className="text-sm text-text-secondary">Share this link to start capturing leads.</p>
              </div>

              <div className="p-4 bg-surface rounded-[var(--r-md)] border border-border-subtle mb-4">
                <p className="text-xs text-text-secondary mb-1">Your link</p>
                <p className="text-sm font-semibold text-text-primary break-all">{displayUrl}</p>
              </div>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-[var(--r-lg)] border border-border-subtle">
                  <UrlQrCode value={liveUrl} sizePx={140} onDataUrl={setQrDataUrl} />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="whatsapp"
                  className="w-full"
                  onClick={() => {
                    const text = `Get a ${settings.offerTitle || 'quote'}: ${liveUrl}`;
                    window.open(buildWhatsAppShareLink(text), '_blank');
                  }}
                >
                  Share on WhatsApp
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={async () => {
                    await navigator.clipboard.writeText(liveUrl);
                    showToast('Link copied!', 'success');
                  }}
                >
                  Copy link
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={!qrDataUrl}
                  onClick={() => {
                    if (qrDataUrl) {
                      downloadDataUrl(qrDataUrl, `${createdCampaign.slug}-qr.png`);
                      showToast('QR downloaded!', 'success');
                    }
                  }}
                >
                  Download QR
                </Button>
              </div>

              <GuideTip className="mt-6">
                Put your QR where people wait: reception desk, counter, car window, flyers.
              </GuideTip>
            </div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-3">You're all set!</h1>
              <p className="text-text-secondary mb-8">
                When a lead comes in, you'll get a notification. Tap to WhatsApp them instantly.
              </p>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-[var(--r-md)] mb-8">
                <p className="text-sm font-medium text-primary">
                  💡 Pro tip: Respond within 5 minutes for the highest conversion rate.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-border-subtle bg-bg">
        <div className="max-w-md mx-auto">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : step === 'welcome'
              ? 'Start setup'
              : step === 'share'
              ? "I've shared it"
              : step === 'complete'
              ? 'Go to dashboard'
              : 'Continue'}
          </Button>
          {step !== 'welcome' && step !== 'complete' && (
            <p className="text-center text-xs text-text-secondary mt-3">
              Step {currentIndex} of {steps.length - 2}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;

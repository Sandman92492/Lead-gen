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

import { motion, AnimatePresence } from 'framer-motion';
import WizardPreview from './ui/WizardPreview';
import {
  TruckIcon,
  FileTextIcon,
  GlobeIcon,
  UsersIcon,
  MessageSquareIcon,
  PinIcon,
  HomeIcon,
  KeyIcon,
  SunIcon,
  BuildingIcon,
  GiftIcon,
  SmartphoneIcon,
  RocketIcon,
  WhatsAppIcon
} from './ui/Icons';

const SOURCE_TYPES: { id: CampaignSourceType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'Vehicle', label: 'Vehicle QR', icon: TruckIcon },
  { id: 'Flyer', label: 'Flyer / Print', icon: FileTextIcon },
  { id: 'Website', label: 'Website', icon: GlobeIcon },
  { id: 'Referral', label: 'Referral', icon: UsersIcon },
  { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquareIcon },
  { id: 'Other', label: 'Other', icon: PinIcon },
];

const INDUSTRY_TEMPLATES = [
  {
    name: 'Home Services',
    icon: HomeIcon,
    offerTitle: 'Free On-Site Quote',
    bullets: ["We'll call you within 15 mins", 'No call-out fee', 'All work guaranteed'],
  },
  {
    name: 'Real Estate',
    icon: KeyIcon,
    offerTitle: 'Property Value Report',
    bullets: ['Current market analysis', 'Sold prices in your area', '100% free of charge'],
  },
  {
    name: 'Solar / Energy',
    icon: SunIcon,
    offerTitle: 'Solar Savings Estimate',
    bullets: ['Instant rough quote', 'Calculate your ROI', 'Expert tech advice'],
  },
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

  const applyTemplate = (template: typeof INDUSTRY_TEMPLATES[0]) => {
    setOfferTitle(template.offerTitle);
    setBullet1(template.bullets[0]);
    setBullet2(template.bullets[1]);
    setBullet3(template.bullets[2]);
    showToast(`${template.name} template applied`, 'success');
  };

  const canProceed = useMemo(() => {
    if (step === 'business') return businessName.trim().length >= 2 && whatsappNumber.trim().length >= 10;
    if (step === 'offer') return offerTitle.trim().length >= 2;
    if (step === 'whatsapp') return whatsappTemplate.trim().length >= 10;
    if (step === 'campaign') return campaignName.trim().length >= 2;
    return true;
  }, [step, businessName, whatsappNumber, offerTitle, whatsappTemplate, campaignName]);

  const inputClass = 'w-full h-12 rounded-[var(--r-lg)] border-2 border-slate-900 bg-bg-card px-4 text-base font-bold text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-4 focus:ring-action-primary/10 transition-all font-mono italic';
  const textareaClass = 'w-full rounded-[var(--r-lg)] border-2 border-slate-900 bg-bg-card px-4 py-3 text-base font-bold text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-4 focus:ring-action-primary/10 transition-all resize-none font-mono italic';
  const labelClass = 'block text-[11px] font-black uppercase tracking-wider text-text-secondary mb-2 ml-1';

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const [direction, setDirection] = useState(1);

  const navigateTo = (next: OnboardingStep) => {
    const nextIdx = steps.indexOf(next);
    setDirection(nextIdx > currentIndex ? 1 : -1);
    setStep(next);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bg-primary flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden supports-[height:100dvh]:h-[100dvh]">
      {/* Sidebar / Preview (Desktop only) */}
      <div className="hidden lg:flex flex-[0.85] bg-bg-primary items-center justify-center border-r border-border-subtle/30 overflow-hidden relative">
        <WizardPreview
          businessName={businessName}
          offerTitle={offerTitle}
          offerBullets={[bullet1, bullet2, bullet3]}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-primary shadow-[-40px_0_100px_rgba(0,0,0,0.05)] z-10 relative">
        {/* Progress bar */}
        {step !== 'welcome' && step !== 'complete' && (
          <div className="h-1.5 w-full bg-border-subtle/20">
            <motion.div
              className="h-full bg-action-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'circOut' }}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-44 md:pb-0">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 32 },
                opacity: { duration: 0.2 }
              }}
              className="max-w-xl mx-auto px-6 py-6 md:py-16 w-full"
            >
              {/* Welcome */}
              {step === 'welcome' && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 md:w-20 md:h-20 bg-action-primary/10 rounded-[var(--r-xl)] flex items-center justify-center mx-auto mb-6 md:mb-8"
                  >
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-text-primary mb-3 md:mb-4 leading-tight">
                    Get your first lead in 3 minutes
                  </h1>
                  <p className="text-base md:text-lg text-text-secondary mb-6 md:mb-10 font-medium">
                    We'll help you set up everything you need to start capturing and converting leads today.
                  </p>
                  <div className="grid gap-3 text-left mb-10">
                    {[
                      { icon: BuildingIcon, text: 'Add your business info' },
                      { icon: GiftIcon, text: 'Create your offer' },
                      { icon: MessageSquareIcon, text: 'Set up WhatsApp follow-up' },
                      { icon: SmartphoneIcon, text: 'Get your QR code' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-bg-primary rounded-[var(--r-lg)] border border-border-subtle/30"
                      >
                        <item.icon className="w-6 h-6 text-action-primary" />
                        <span className="text-base font-bold text-text-primary">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Setup */}
              {step === 'business' && (
                <div className="space-y-8">
                  <header>
                    <h1 className="text-3xl font-display font-black text-text-primary mb-2">Build your brand</h1>
                    <p className="text-text-secondary font-medium">This is how customers will see your business.</p>
                  </header>

                  <div className="space-y-6">
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
                      <label className={labelClass}>Your WhatsApp number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-secondary font-bold">
                          +27
                        </div>
                        <input
                          type="tel"
                          value={whatsappNumber.replace(/^27/, '')}
                          onChange={(e) => setWhatsappNumber('27' + e.target.value.replace(/\D/g, '').slice(-9))}
                          placeholder="82 123 4567"
                          className={inputClass + ' pl-12'}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-text-secondary/70 font-medium">
                        Your first lead will be sent to this number instantly.
                      </p>
                    </div>
                  </div>

                  <GuideTip className="mt-8 border-action-primary/20 bg-action-primary/5 p-4 rounded-[var(--r-lg)]">
                    <p className="text-xs font-bold text-action-primary leading-relaxed">
                      💡 We'll use this info on your lead page and for instant WhatsApp responses.
                    </p>
                  </GuideTip>
                </div>
              )}

              {/* Offer Setup */}
              {step === 'offer' && (
                <div className="space-y-8">
                  <header>
                    <h1 className="text-3xl font-display font-black text-text-primary mb-2">Create your offer</h1>
                    <p className="text-text-secondary font-medium">Give people a high-value reason to tap your QR code.</p>
                  </header>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-[10px] font-black uppercase text-text-secondary/60 w-full mb-1">Quick Templates:</span>
                    {INDUSTRY_TEMPLATES.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => applyTemplate(t)}
                        className="px-3 py-1.5 rounded-full border border-border-subtle bg-bg-card text-xs font-bold text-text-primary hover:border-action-primary transition-colors flex items-center gap-1.5"
                      >
                        <t.icon className="w-4 h-4" /> {t.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Headline Offer</label>
                      <input
                        type="text"
                        value={offerTitle}
                        onChange={(e) => setOfferTitle(e.target.value)}
                        placeholder="e.g. Free Quote, 10% Off, Free Consultation"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>What happens next? (3 short bullets)</label>
                      <div className="space-y-3">
                        {[
                          { val: bullet1, set: setBullet1, placeholder: "e.g. We'll call you within 5 minutes" },
                          { val: bullet2, set: setBullet2, placeholder: "e.g. Get a no-obligation quote" },
                          { val: bullet3, set: setBullet3, placeholder: "e.g. Book at a time that suits you" }
                        ].map((b, i) => (
                          <div key={i} className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-action-primary font-black text-xs">✓</span>
                            <input
                              type="text"
                              value={b.val}
                              onChange={(e) => b.set(e.target.value)}
                              placeholder={b.placeholder}
                              className={inputClass + ' pl-9'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Template */}
              {step === 'whatsapp' && (
                <div className="space-y-8">
                  <header>
                    <h1 className="text-3xl font-display font-black text-text-primary mb-2">Auto-Response</h1>
                    <p className="text-text-secondary font-medium">The instant message sent when a lead comes in.</p>
                  </header>

                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Message template</label>
                      <textarea
                        value={whatsappTemplate}
                        onChange={(e) => setWhatsappTemplate(e.target.value)}
                        rows={5}
                        className={textareaClass}
                        placeholder="Hi {name}! Thanks for your enquiry..."
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {['{name}', '{campaign}', '{suburb}'].map(v => (
                          <button
                            key={v}
                            onClick={() => setWhatsappTemplate(prev => prev + ' ' + v)}
                            className="text-[10px] font-bold bg-bg-primary border border-border-subtle px-2 py-1 rounded-md text-text-secondary hover:text-action-primary"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative p-5 bg-[#E7FADF] rounded-[24px] border border-emerald-500/10 shadow-sm overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <WhatsAppIcon className="w-12 h-12" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#075E54] mb-3 opacity-60">Preview Message:</p>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {whatsappTemplate
                          .replace('{name}', 'John')
                          .replace('{campaign}', 'Vehicle QR')
                          .replace('{suburb}', 'Sandton')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Campaign Creation */}
              {step === 'campaign' && (
                <div className="space-y-8">
                  <header>
                    <h1 className="text-3xl font-display font-black text-text-primary mb-2">Your first QR code</h1>
                    <p className="text-text-secondary font-medium">Where will you put this campaign to attract leads?</p>
                  </header>

                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Campaign name</label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="e.g. Bakkie QR, Store Front, Website"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Source category</label>
                      <div className="grid grid-cols-2 gap-3">
                        {SOURCE_TYPES.map((source) => (
                          <button
                            key={source.id}
                            type="button"
                            onClick={() => setCampaignSource(source.id)}
                            className={`p-4 rounded-[var(--r-xl)] border-2 text-left transition-all relative overflow-hidden group ${campaignSource === source.id
                              ? 'border-action-primary bg-action-primary/5 shadow-xl'
                              : 'border-slate-900 bg-bg-card hover:border-action-primary'
                              }`}
                          >
                            <source.icon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform text-text-primary/70" />
                            <p className="text-sm font-bold text-text-primary">{source.label}</p>
                            {campaignSource === source.id && (
                              <div className="absolute top-2 right-2">
                                <div className="bg-action-primary rounded-full p-0.5">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Share */}
              {step === 'share' && createdCampaign && (
                <div className="space-y-8 text-center">
                  <header>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <h1 className="text-3xl font-display font-black text-text-primary mb-2">System Ready!</h1>
                    <p className="text-text-secondary font-medium">Your link is live and tracking.</p>
                  </header>

                  <div className="p-5 bg-bg-primary rounded-[var(--r-xl)] border-2 border-dashed border-border-subtle relative">
                    <p className="text-[10px] font-black uppercase text-text-secondary w-full mb-2">Live Public Link</p>
                    <p className="text-base font-black text-action-primary underline break-all font-mono">{displayUrl}</p>
                  </div>

                  <div className="flex justify-center group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-6 bg-white rounded-[40px] shadow-2xl border-4 border-slate-900 group-hover:shadow-action-primary/20 transition-all"
                    >
                      <UrlQrCode value={liveUrl} sizePx={160} onDataUrl={setQrDataUrl} />
                    </motion.div>
                  </div>

                  <div className="grid gap-3 pt-4">
                    <Button
                      variant="whatsapp"
                      className="w-full h-14 text-lg font-black"
                      onClick={() => {
                        const text = `Get a ${offerTitle || 'quote'}: ${liveUrl}`;
                        window.open(buildWhatsAppShareLink(text), '_blank');
                      }}
                    >
                      Share on WhatsApp
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        className="flex-1 font-bold"
                        onClick={async () => {
                          await navigator.clipboard.writeText(liveUrl);
                          showToast('Link copied!', 'success');
                        }}
                      >
                        Copy link
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1 font-bold"
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
                  </div>
                </div>
              )}

              {/* Complete */}
              {step === 'complete' && (
                <div className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.6 }}
                    className="w-24 h-24 bg-success/10 rounded-[32px] flex items-center justify-center mx-auto mb-8"
                  >
                    <RocketIcon className="w-12 h-12 text-success" />
                  </motion.div>
                  <h1 className="text-4xl font-display font-black text-text-primary mb-4">You're unstoppable!</h1>
                  <p className="text-xl text-text-secondary font-medium mb-12">
                    When a lead comes in, we'll notify you instantly. Tap their message and close the deal.
                  </p>

                  <div className="p-6 bg-action-primary/5 border-2 border-action-primary/20 rounded-[var(--r-xl)] text-left">
                    <h3 className="text-lg font-black text-action-primary mb-2">💡 Winning Pro-Tip:</h3>
                    <p className="text-base font-bold text-slate-600 leading-relaxed">
                      Leads are 7x more likely to buy if you respond within <span className="text-action-primary underline">5 minutes</span>. Stay fast!
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 md:static w-full p-3 md:p-10 border-t border-border-subtle/50 bg-bg-card shadow-[0_-10px_40px_rgba(0,0,0,0.02)] shrink-0 z-50 transition-all safe-area-bottom">
          <div className="max-w-xl mx-auto flex flex-col items-center">
            <Button
              variant="primary"
              className="w-full h-12 md:h-16 text-lg md:text-xl font-black rounded-[var(--r-xl)] shadow-lg shadow-action-primary/25 active:scale-[0.97]"
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : step === 'welcome'
                  ? 'LFG →'
                  : step === 'share'
                    ? "I'm ready to sell"
                    : step === 'complete'
                      ? 'Go to dashboard'
                      : 'Continue →'}
            </Button>

            {currentIndex > 0 && step !== 'complete' && (
              <button
                onClick={() => {
                  const prev = steps[currentIndex - 1];
                  if (prev) navigateTo(prev);
                }}
                className="mt-2 md:mt-4 text-xs md:text-sm font-black text-text-secondary/50 hover:text-text-secondary uppercase tracking-widest transition-colors p-2"
              >
                Go Back
              </button>
            )}

            {step !== 'welcome' && step !== 'complete' && (
              <p className="hidden md:block text-center text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.2em] mt-6">
                Step {currentIndex} of {steps.length - 2}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;

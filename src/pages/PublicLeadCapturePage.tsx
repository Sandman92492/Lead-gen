import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PublicBrandHeader from '../components/PublicBrandHeader';
import { createLeadAndPublicPass, getCampaignBySlug, getPublicSettings } from '../services/leadWallet';
import type { Campaign, Lead, PublicSettings } from '../types/leadWallet';

const FALLBACK_BUDGET_OPTIONS: string[] = ['Not sure', 'Low', 'Medium', 'High'];
const FALLBACK_TIMELINE_OPTIONS: string[] = ['ASAP', '1–3 months', 'Just checking'];

const normalizeSaNumber = (raw: string): string | null => {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('27') && digits.length >= 11 && digits.length <= 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `27${digits.slice(1)}`;
  if (digits.length === 9) return `27${digits}`;
  return digits.length >= 10 ? digits : null;
};

const PublicLeadCapturePage: React.FC<{ campaignSlug: string }> = ({ campaignSlug }) => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [suburb, setSuburb] = useState('');
  const [monthlyBillRange, setMonthlyBillRange] = useState<Lead['monthlyBillRange']>('');
  const [timeline, setTimeline] = useState<Lead['timeline']>('');
  const [serviceType, setServiceType] = useState<string>('');

  const budgetOptions = useMemo(() => {
    const opts = settings?.budgetOptions?.length ? settings.budgetOptions : FALLBACK_BUDGET_OPTIONS;
    return opts.map((o) => String(o)).filter((o) => o.trim().length > 0);
  }, [settings?.budgetOptions]);

  const timelineOptions = useMemo(() => {
    const opts = settings?.timelineOptions?.length ? settings.timelineOptions : FALLBACK_TIMELINE_OPTIONS;
    return opts.map((o) => String(o)).filter((o) => o.trim().length > 0);
  }, [settings?.timelineOptions]);

  const serviceTypeOptions = useMemo(() => {
    const opts = settings?.serviceTypeOptions?.length ? settings.serviceTypeOptions : [];
    return opts.map((o) => String(o)).filter((o) => o.trim().length > 0);
  }, [settings?.serviceTypeOptions]);

  useEffect(() => {
    if (!campaignSlug) return;
    let mounted = true;
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        const [s, c] = await Promise.all([getPublicSettings(), getCampaignBySlug(campaignSlug)]);
        if (!mounted) return;
        setSettings(s);
        setCampaign(c);
        setIsLoading(false);
        if (!c) setError('This campaign link is no longer available.');
      } catch {
        if (!mounted) return;
        setIsLoading(false);
        setError('Unable to load this page. Please try again.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [campaignSlug]);

  useEffect(() => {
    if (!settings) return;

    setMonthlyBillRange((prev) => {
      if (prev && budgetOptions.includes(prev)) return prev;
      return budgetOptions[0] || '';
    });

    setTimeline((prev) => {
      if (prev && timelineOptions.includes(prev)) return prev;
      return timelineOptions[0] || '';
    });

    setServiceType((prev) => {
      if (!settings.serviceTypeEnabled) return '';
      if (prev && serviceTypeOptions.includes(prev)) return prev;
      return serviceTypeOptions[0] || '';
    });
  }, [budgetOptions, serviceTypeOptions, settings, timelineOptions]);

  const canSubmit = useMemo(() => {
    if (!campaign || !settings) return false;
    if (isSubmitting) return false;
    if (fullName.trim().length < 2) return false;
    if (!normalizeSaNumber(phone)) return false;
    if (suburb.trim().length < 2) return false;
    if (settings.serviceTypeEnabled && serviceTypeOptions.length > 0 && !serviceType.trim()) return false;
    return true;
  }, [campaign, fullName, isSubmitting, phone, serviceType, serviceTypeOptions.length, settings, suburb]);

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="mx-auto w-full max-w-md space-y-5 pb-12">
        {settings && <PublicBrandHeader businessName={settings.businessName} logoUrl={settings.logoUrl} />}

        <header className="px-4 text-center">
          <h1 className="text-3xl font-display font-black tracking-tight text-text-primary">{settings?.offerTitle || 'Offer'}</h1>
          <p className="mt-2 text-sm text-text-secondary">Takes 30 seconds. Get your Benefit Pass instantly.</p>
          <p className="mt-2 text-xs text-text-secondary">No spam — we’ll WhatsApp you shortly.</p>
        </header>

        <section className="rounded-[32px] border border-border-subtle bg-bg-card p-6 shadow-[0_24px_60px_rgba(11,23,42,0.12)]">
          {isLoading && <div className="text-sm text-text-secondary">Loading…</div>}

          {!isLoading && error && (
            <div className="rounded-2xl border border-urgency-high bg-urgency-high/10 p-4 text-sm font-semibold text-urgency-high">
              {error}
            </div>
          )}

          {!isLoading && !error && campaign && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!campaign || !settings || !canSubmit) return;
                setIsSubmitting(true);
                setError(null);
                try {
                  const normalized = normalizeSaNumber(phone);
                  if (!normalized) {
                    setError('Please enter a valid South African phone number.');
                    setIsSubmitting(false);
                    return;
                  }
                  const result = await createLeadAndPublicPass({
                    campaign,
                    settings,
                    fullName,
                    phone: normalized,
                    suburb,
                    monthlyBillRange,
                    timeline,
                    serviceType: settings.serviceTypeEnabled ? (serviceType.trim() ? serviceType : null) : null,
                  });
                  navigate(`/p/${result.leadId}`, { replace: true });
                } catch {
                  setError('Submission failed. Please try again.');
                  setIsSubmitting(false);
                }
              }}
            >
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="e.g. 082 123 4567"
                  className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Suburb</label>
                <input
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  required
                  autoComplete="address-level2"
                  className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">{settings?.budgetLabel || 'Budget range'}</label>
                <select
                  value={monthlyBillRange}
                  onChange={(e) => setMonthlyBillRange(e.target.value as Lead['monthlyBillRange'])}
                  className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm font-semibold text-text-primary focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                >
                  {budgetOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">{settings?.timelineLabel || 'Timeline'}</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value as Lead['timeline'])}
                  className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm font-semibold text-text-primary focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                >
                  {timelineOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {settings?.serviceTypeEnabled && (
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-2">
                    {settings?.serviceTypeLabel || 'What do you need help with?'}
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm font-semibold text-text-primary focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  >
                    {serviceTypeOptions.length === 0 && <option value="">—</option>}
                    {serviceTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={!canSubmit}>
                {isSubmitting ? 'Creating your pass…' : 'Create my Benefit Pass'}
              </Button>

              <div className="text-center text-xs text-text-secondary">You’ll get your Benefit Pass instantly.</div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

export default PublicLeadCapturePage;

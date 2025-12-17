import React, { useMemo, useState } from 'react';
import BaseModal from '../components/BaseModal';
import ContactDropdown from '../components/ContactDropdown';
import ImageWithSkeleton from '../components/ui/ImageWithSkeleton';
import { useAllDeals } from '../hooks/useAllDeals';
import { useVendor } from '../hooks/useVendor';
import type { Deal } from '../types';
import { copy } from '../copy';

const normalizeDealImageUrl = (raw: string | null): string | null => {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith('/')) return value;
  return `/${value}`;
};

const formatBenefitTitle = (name: string): string => name.replace(/^raffle:\s*/i, '').trim();

const getBenefitFallbackImage = (deal: Deal): string => {
  const title = formatBenefitTitle(deal.name).toLowerCase();
  if (title.includes('golf')) return '/Images/benefits/golf.svg';
  if (title.includes('tennis') || title.includes('padel') || title.includes('court')) return '/Images/benefits/courts.svg';
  if (title.includes('clubhouse') || title.includes('dining') || title.includes('restaurant') || title.includes('credit')) {
    return '/Images/benefits/dining.svg';
  }
  if (title.includes('shop') || title.includes('pro shop') || title.includes('discount')) return '/Images/benefits/shop.svg';
  if (title.includes('spa') || title.includes('wellness') || title.includes('massage')) return '/Images/benefits/wellness.svg';

  const category = (deal.category || '').toLowerCase();
  if (category === 'restaurant') return '/Images/benefits/dining.svg';
  if (category === 'shopping') return '/Images/benefits/shop.svg';
  if (category === 'lifestyle') return '/Images/benefits/wellness.svg';
  return '/Images/benefits/golf.svg';
};

const safeParseMs = (iso?: string | null): number | null => {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
};

const scoreDeal = (deal: Deal, nowMs: number): number => {
  const featuredBoost = deal.featured ? 10_000 : 0;
  const savingsBoost = Math.max(0, deal.savings ?? 0);
  const createdAtMs = safeParseMs(deal.createdAt);
  const daysOld = createdAtMs ? (nowMs - createdAtMs) / (1000 * 60 * 60 * 24) : null;
  const recencyBoost = daysOld == null ? 0 : Math.max(0, 250 - Math.floor(daysOld) * 10);
  return featuredBoost + savingsBoost + recencyBoost;
};

const OfferCard: React.FC<{
  deal: Deal;
  onSelect: (deal: Deal) => void;
}> = ({ deal, onSelect }) => {
  const image = normalizeDealImageUrl(deal.imageUrl || null) || getBenefitFallbackImage(deal);
  const title = formatBenefitTitle(deal.name);
  return (
    <button
      type="button"
      onClick={() => onSelect(deal)}
      className="offer-card-hero group text-left"
    >
      <div className="relative h-52 overflow-hidden rounded-t-xl">
        {image ? (
          <ImageWithSkeleton
            src={image}
            alt={deal.name}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center bg-bg-primary text-text-secondary">
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 13l2-2 3 3 2-2 3 3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" />
        {(deal.savings ?? 0) > 0 && (
          <div className="absolute top-3 right-3 rounded-full border border-white/60 bg-black/40 px-3 py-1 text-[11px] font-semibold text-white">
            Save R{deal.savings}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mt-2 text-lg font-semibold text-text-primary">{title}</div>
        <p className="mt-1 text-sm text-text-secondary line-clamp-2">{deal.offer}</p>
        {(deal.city || '').trim() && (
          <div className="mt-3 text-xs font-semibold text-text-secondary">{deal.city}</div>
        )}
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-action-primary">
          <span className="flex items-center gap-1">
            Details
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      </div>
    </button>
  );
};

const OfferDetailModal: React.FC<{
  deal: Deal | null;
  onClose: () => void;
}> = ({ deal, onClose }) => {
  const { vendor } = useVendor(deal?.vendorId || '');
  if (!deal) return null;

  const mapsUrl = vendor?.mapsUrl || null;
  const title = formatBenefitTitle(deal.name);

  return (
    <BaseModal isOpen={!!deal} onClose={onClose} maxWidth="md" showCloseButton>
      <div className="space-y-6">
        <div>
          <h2 className="mt-2 text-3xl font-display font-black text-text-primary">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-text-secondary">
            {vendor?.name || 'Benefit'}
            {deal.city ? ` • ${deal.city}` : ''}
          </p>
        </div>

        <div className="rounded-[28px] border border-border-subtle bg-bg-primary p-5">
          <p className="mt-2 text-xl font-semibold text-text-primary">{deal.offer}</p>
        </div>

        {deal.description && (
          <div>
            <p className="mt-2 text-sm leading-relaxed text-text-primary whitespace-pre-wrap">{deal.description}</p>
          </div>
        )}

        {deal.terms && (
          <div className="rounded-[28px] border border-border-subtle bg-bg-primary p-5">
            <p className="mt-2 text-sm leading-relaxed text-text-primary whitespace-pre-wrap">{deal.terms}</p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-bg-card px-4 py-3 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-bg-primary"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 10.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              Directions
            </a>
          )}

          <ContactDropdown email={vendor?.email} phone={vendor?.phone} className={!mapsUrl ? 'sm:col-span-2' : ''} />
        </div>
      </div>
    </BaseModal>
  );
};

const OffersPage: React.FC = () => {
  const { deals, isLoading, error } = useAllDeals();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Deal | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const nowMs = Date.now();
    return deals
      .filter((deal) => {
        if (!q) return true;
        return (
          formatBenefitTitle(deal.name).toLowerCase().includes(q) ||
          deal.offer.toLowerCase().includes(q) ||
          (deal.city || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => scoreDeal(b, nowMs) - scoreDeal(a, nowMs));
  }, [deals, query]);

  return (
    <main className="relative px-4 pb-32 pt-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[32px] border border-border-subtle bg-action-primary shadow-[0_30px_80px_rgba(11,23,42,0.35)] text-white">
          <div className="pointer-events-none absolute inset-0">
            <img
              src="/Images/hero-v4.webp"
              alt=""
              className="h-full w-full object-cover opacity-60"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/55" />
          </div>
          <div className="relative z-10 p-8 sm:p-12">
            <h1 className="mt-3 text-3xl font-display font-black tracking-tight sm:text-4xl">
              {copy.nav.offers}
            </h1>
            <div className="mt-5 inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-medium text-white">
              {filtered.length} {filtered.length === 1 ? 'benefit' : 'benefits'}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-border-subtle bg-bg-card p-6 shadow-[0_24px_60px_rgba(11,23,42,0.18)]">
          <div>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search benefits…"
                className="w-full rounded-xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-text-secondary">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-[28px] border border-urgency-high bg-urgency-high/10 p-5 text-sm font-semibold text-urgency-high">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="offer-card-hero animate-pulse bg-bg-primary"
              >
                <div className="h-48 w-full rounded-[24px] bg-bg-primary" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 rounded-full bg-bg-primary" />
                  <div className="h-5 w-28 rounded-full bg-bg-primary" />
                  <div className="h-3 w-16 rounded-full bg-bg-primary" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-[28px] border border-border-subtle bg-bg-card p-10 text-center">
            <div className="text-sm font-semibold text-text-primary">No benefits found.</div>
            <div className="mt-2 text-sm text-text-secondary">Try a different search term.</div>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((deal, index) => (
              <OfferCard
                key={deal.id || `${deal.vendorId}_${index}`}
                deal={deal}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      <OfferDetailModal deal={selected} onClose={() => setSelected(null)} />
    </main>
  );
};

export default OffersPage;

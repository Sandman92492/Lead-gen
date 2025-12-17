import React, { useMemo, useState } from 'react';
import BaseModal from '../components/BaseModal';
import ContactDropdown from '../components/ContactDropdown';
import ImageWithSkeleton from '../components/ui/ImageWithSkeleton';
import { useAllDeals } from '../hooks/useAllDeals';
import { useVendor } from '../hooks/useVendor';
import type { Deal } from '../types';
import { copy } from '../copy';

type CategoryFilter = 'all' | 'restaurant' | 'activity' | 'shopping' | 'lifestyle';

const categoryLabel: Record<CategoryFilter, string> = {
  all: 'All',
  restaurant: 'Dining',
  activity: 'Experiences',
  shopping: 'Shopping',
  lifestyle: 'Lifestyle',
};

const filterDetails: Record<CategoryFilter, { description: string; icon: JSX.Element }> = {
  all: {
    description: 'Every perk',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 5h5v5H5zM5 14h5v5H5zM14 5h5v5h-5zM14 14h5v5h-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  restaurant: {
    description: 'Dining moments',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 5v14M13 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5 7h2a2 2 0 0 1 2 2v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 5h-2a2 2 0 0 0-2 2v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  activity: {
    description: 'Curated outings',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l2.2 5.6L20 9.4l-4.4 3.8 1.4 5.7L12 16.8 7 18.9l1.4-5.7L4 9.4l5.8-.8L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  shopping: {
    description: 'Retail & indulgence',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 8h12l-1.5 10h-9L6 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 6a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  lifestyle: {
    description: 'Wellness & leisure',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 16v4M8 18l-2 1.5M16 18l2 1.5M4.5 12H8M16 12h3.5M8 4l-2 1.5M18 4l2 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

const formatCategory = (value?: string): string => {
  const key = (value || '').toLowerCase() as CategoryFilter;
  return categoryLabel[key] || 'Offer';
};

const normalizeDealImageUrl = (raw: string | null): string | null => {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith('/')) return value;
  return `/${value}`;
};

const OfferDetailModal: React.FC<{
  deal: Deal | null;
  onClose: () => void;
}> = ({ deal, onClose }) => {
  const { vendor } = useVendor(deal?.vendorId || '');
  if (!deal) return null;

  const mapsUrl = vendor?.mapsUrl || null;

  return (
    <BaseModal isOpen={!!deal} onClose={onClose} maxWidth="md" showCloseButton>
      <div className="space-y-6">
        <div>
          <div className="kicker">Offer spotlight</div>
          <h2 className="mt-2 text-3xl font-display font-black text-text-primary">{deal.name}</h2>
          <p className="mt-1 text-sm font-semibold text-text-secondary">
            {vendor?.name || formatCategory(deal.category)}
            {deal.city ? ` • ${deal.city}` : ''}
          </p>
        </div>

        <div className="rounded-[28px] border border-border-subtle bg-bg-primary p-5">
          <div className="kicker">Benefit</div>
          <p className="mt-2 text-xl font-semibold text-text-primary">{deal.offer}</p>
        </div>

        {deal.description && (
          <div>
            <div className="kicker">Details</div>
            <p className="mt-2 text-sm leading-relaxed text-text-primary whitespace-pre-wrap">{deal.description}</p>
          </div>
        )}

        {deal.terms && (
          <div className="rounded-[28px] border border-border-subtle bg-bg-primary p-5">
            <div className="kicker">Terms</div>
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
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Deal | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals
      .filter((deal) => (category === 'all' ? true : deal.category === category))
      .filter((deal) => {
        if (!q) return true;
        return (
          deal.name.toLowerCase().includes(q) ||
          deal.offer.toLowerCase().includes(q) ||
          (deal.city || '').toLowerCase().includes(q)
        );
      });
  }, [category, deals, query]);

  const categories: CategoryFilter[] = ['all', 'restaurant', 'activity', 'shopping', 'lifestyle'];

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
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">Estate perks</p>
            <h1 className="mt-3 text-3xl font-display font-black tracking-tight sm:text-4xl">
              {copy.nav.offers}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">
              Curated experiences across dining, leisure, and shopping.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium">
              <span className="rounded-full bg-white/20 px-4 py-2 text-white">Vetted partners</span>
              <span className="rounded-full bg-white/20 px-4 py-2 text-white">{filtered.length} {filtered.length === 1 ? 'offer' : 'offers'}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-border-subtle bg-bg-card p-6 shadow-[0_24px_60px_rgba(11,23,42,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-black text-text-primary">{copy.nav.offers}</h2>
              <p className="text-sm text-text-secondary">Curated benefits for members and residents.</p>
            </div>
            <div className="text-sm font-medium text-text-secondary">{filtered.length} available</div>
          </div>

          <div className="mt-5">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search offers…"
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

          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((value) => {
              const active = category === value;
              const details = filterDetails[value];
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(value)}
                  className={`filter-pill ${active ? 'active' : ''}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full" aria-hidden="true">
                    {details.icon}
                  </span>
                  <div className="leading-tight text-left text-[12px]">
                    <div>{categoryLabel[value]}</div>
                    <div className="text-[10px] font-normal text-text-secondary">{details.description}</div>
                  </div>
                </button>
              );
            })}
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
            <div className="text-sm font-semibold text-text-primary">No offers found.</div>
            <div className="mt-2 text-sm text-text-secondary">Try a different category or search term.</div>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((deal, index) => {
              const image = normalizeDealImageUrl(deal.imageUrl || null);
              return (
                <button
                  key={deal.id || `${deal.vendorId}_${index}`}
                  type="button"
                  onClick={() => setSelected(deal)}
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
                    <div className="absolute top-3 left-3 rounded-full border border-white/60 bg-black/40 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-white">
                      {formatCategory(deal.category)}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="kicker">{deal.city || formatCategory(deal.category)}</div>
                    <div className="mt-2 text-lg font-semibold text-text-primary">{deal.name}</div>
                    <p className="mt-1 text-sm text-text-secondary line-clamp-2">{deal.offer}</p>
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
            })}
          </div>
        )}
      </div>

      <OfferDetailModal deal={selected} onClose={() => setSelected(null)} />
    </main>
  );
};

export default OffersPage;

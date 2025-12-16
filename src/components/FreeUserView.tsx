import React, { useState, useEffect, useMemo } from 'react';
import Hero from './Hero';
import TrustBar from './TrustBar';
import CharitySection from './CharitySection';
import HowItWorks from './HowItWorks';
import FAQ from './FAQ';
import PricingOptions from './PricingOptions';
import CompactDealCard from './CompactDealCard';
import { PassType } from '../types';
import { getPassPrice } from '../utils/pricing';
import { useAllDeals } from '../hooks/useAllDeals';

interface FreeUserViewProps {
  onSelectPass: (passType: PassType) => void;
  onActivateClick: () => void;
  onMainCtaClick: () => void;
  onBuyPassClick?: () => void;
  isOnline?: boolean;
}

const FreeUserView: React.FC<FreeUserViewProps> = ({
  onSelectPass,
  onActivateClick,
  onMainCtaClick,
  onBuyPassClick,
  isOnline = true,
}) => {
  const [passPrice, setPassPrice] = useState({ price: 199, cents: 19900, launchPricing: false });
  const { deals: allDeals = [] } = useAllDeals();

  const topPicksDeals = useMemo(() => {
    if (!allDeals || allDeals.length === 0) return [];

    const dealsWithSavings = allDeals.filter((deal) => (deal.savings || 0) > 0);
    const sourceDeals = dealsWithSavings.length >= 6 ? dealsWithSavings : allDeals;

    return [...sourceDeals].sort((a, b) => (b.savings || 0) - (a.savings || 0)).slice(0, 6);
  }, [allDeals]);

  const venueCount = useMemo(() => {
    const vendorIds = new Set(allDeals.map((deal) => deal.vendorId).filter(Boolean));
    return vendorIds.size;
  }, [allDeals]);

  // Load price once at parent level
  useEffect(() => {
    const loadData = async () => {
      const price = await getPassPrice();
      setPassPrice(price);
    };
    loadData();
  }, []);

  return (
    <>
      <main className="bg-bg-primary">
        <Hero
          onButtonClick={onMainCtaClick}
          buttonText={`Buy Pass (R${passPrice.price})`}
          passHolderName={null}
          onActivateClick={onActivateClick}
          appStatus="guest"
          venueCount={venueCount}
        />

        {!isOnline && (
          <section>
            <div className="w-full bg-urgency-high/10 border-y border-urgency-high/30">
              <div className="container mx-auto px-4 sm:px-6 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-urgency-high" aria-hidden="true">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 9a1 1 0 102 0 1 1 0 00-2 0zm.25 6a.75.75 0 001.5 0v-4a.75.75 0 00-1.5 0v4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-text-secondary text-sm">
                    You are offline. Pricing may be outdated.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Top Picks */}
        {topPicksDeals.length > 0 && (
          <section id="top-picks" className="bg-bg-primary py-10 md:py-14 border-b border-border-subtle">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs md:text-sm font-semibold text-action-primary uppercase tracking-widest mb-2">
                    Top savings right now
                  </p>
                  <h2 className="text-2xl md:text-3xl font-display font-black text-text-primary">
                    Preview a few top deals
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onMainCtaClick}
                  className="text-sm font-semibold text-action-primary hover:underline underline-offset-4 flex-shrink-0"
                >
                  Sign in to see all deals →
                </button>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-2">
                  {topPicksDeals.map((deal, index) => (
                    <CompactDealCard
                      key={deal.id || deal.name}
                      deal={deal}
                      index={index}
                      isRedeemed={false}
                      hasPass={false}
                      onBuyPassClick={onBuyPassClick || onMainCtaClick}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs text-text-secondary">
                Tap a deal to preview. Sign in to browse all deals — pass required to redeem in-store.
              </p>
            </div>
          </section>
        )}

        {/* Why It Works */}
        <section className="bg-bg-card py-10 md:py-14 border-b border-border-subtle">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-display font-black text-action-primary mb-6">
                Perfect for your visit
              </h2>

              <ul className="grid gap-3 sm:grid-cols-3 text-left">
                <li className="flex items-start gap-3 bg-bg-primary rounded-xl p-4 border border-border-subtle">
                  <span className="mt-0.5 text-success font-bold" aria-hidden="true">✓</span>
                  <span className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">Use instantly</span> on your phone
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-bg-primary rounded-xl p-4 border border-border-subtle">
                  <span className="mt-0.5 text-success font-bold" aria-hidden="true">✓</span>
                  <span className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">Verified in-store</span> (partners trust it)
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-bg-primary rounded-xl p-4 border border-border-subtle">
                  <span className="mt-0.5 text-success font-bold" aria-hidden="true">✓</span>
                  <span className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">Built for short stays</span> — save more than the pass costs
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* Social Proof */}
        <TrustBar venueCount={venueCount} />

        <PricingOptions onSelectPass={onSelectPass} passPrice={passPrice} />

        <FAQ />

        <CharitySection />
      </main>
    </>
  );
};

export default FreeUserView;

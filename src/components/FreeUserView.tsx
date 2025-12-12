import React, { useState, useEffect, useMemo } from 'react';
import Hero from './Hero';
import TrustBar from './TrustBar';
import CharitySection from './CharitySection';
import HowItWorks from './HowItWorks';
import HorizontalCategoryRow from './HorizontalCategoryRow';
import FAQ from './FAQ';
import PricingOptions from './PricingOptions';
import { PassType, Deal } from '../types';
import { getPassPrice, getPassCount } from '../utils/pricing';
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
  const [passCount, setPassCount] = useState(0);
  const { deals: allDeals = [] } = useAllDeals();

  const venueCount = useMemo(() => {
    const vendorIds = new Set(allDeals.map((deal) => deal.vendorId).filter(Boolean));
    return vendorIds.size;
  }, [allDeals]);

  const sortDealsBySavings = (deals: Deal[]) => {
    return [...deals].sort((a, b) => (b.savings || 0) - (a.savings || 0));
  };

  // Load price, pass count, and venue count once at parent level
  useEffect(() => {
    const loadData = async () => {
      const [price, count] = await Promise.all([
        getPassPrice(),
        getPassCount(),
      ]);
      setPassPrice(price);
      setPassCount(count);
    };
    loadData();
  }, []);

  return (
    <>
      <main className="pb-24 md:pb-0 bg-bg-primary">
        <Hero
          onButtonClick={onMainCtaClick}
          buttonText="Get My Holiday Pass Now"
          passHolderName={null}
          onActivateClick={onActivateClick}
          appStatus="guest"
          passPrice={passPrice.price}
          passCount={passCount}
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
                    You are offline. Pricing and pass counts may be outdated.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <TrustBar venueCount={venueCount} />
        <CharitySection />
        <HowItWorks />
        {/* Category Carousels */}
        {allDeals.length > 0 && (
          <section className="bg-bg-primary">
            {/* Heading */}
            <div className="container mx-auto px-4 sm:px-6 py-8 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-black text-action-primary mb-4">
                All Deals
              </h2>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                Browse {allDeals.length}+ local deals. Get your pass to unlock them all.
              </p>
            </div>

            <HorizontalCategoryRow
                title="Local Eats & Treats"
                emoji="🍔"
                description="Support our favorite local food spots"
                deals={sortDealsBySavings(allDeals.filter((deal) => deal.category === 'restaurant'))}
                redeemedDeals={[]}
                onRedeemClick={() => onBuyPassClick?.() || onMainCtaClick()}
                hasPass={false}
                onBuyPassClick={onBuyPassClick || onMainCtaClick}
              />
              <HorizontalCategoryRow
                title="Activities & Adventure"
                emoji="🛶"
                description="Unforgettable experiences in Port Alfred"
                deals={sortDealsBySavings(allDeals.filter((deal) => deal.category === 'activity'))}
                redeemedDeals={[]}
                onRedeemClick={() => onBuyPassClick?.() || onMainCtaClick()}
                hasPass={false}
                onBuyPassClick={onBuyPassClick || onMainCtaClick}
              />
            <HorizontalCategoryRow
              title="Lifestyle & Wellness"
              emoji="✨"
              description="Local shops, spas, and wellness"
              deals={sortDealsBySavings(allDeals.filter((deal) => deal.category === 'shopping'))}
              redeemedDeals={[]}
              onRedeemClick={() => onBuyPassClick?.() || onMainCtaClick()}
              hasPass={false}
              onBuyPassClick={onBuyPassClick || onMainCtaClick}
            />
          </section>
        )}
        <FAQ />
        <PricingOptions onSelectPass={onSelectPass} passPrice={passPrice} />
      </main>
    </>
  );
};

export default FreeUserView;

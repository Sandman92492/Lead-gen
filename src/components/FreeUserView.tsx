import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import TrustBar from './TrustBar';
import CharitySection from './CharitySection';
import HowItWorks from './HowItWorks';
import HorizontalCategoryRow from './HorizontalCategoryRow';
import FAQ from './FAQ';
import PricingOptions from './PricingOptions';
import { PassType } from '../types';
import { getPassPrice, getPassCount, getPassFeatures } from '../utils/pricing';
import { useAllDeals } from '../hooks/useAllDeals';

interface FreeUserViewProps {
  onSelectPass: (passType: PassType) => void;
  onActivateClick: () => void;
  onMainCtaClick: () => void;
  onBuyPassClick?: () => void;
}

const FreeUserView: React.FC<FreeUserViewProps> = ({
  onSelectPass,
  onActivateClick,
  onMainCtaClick,
  onBuyPassClick,
}) => {
  const [passPrice, setPassPrice] = useState({ price: 199, cents: 19900, launchPricing: false });
  const [passCount, setPassCount] = useState(0);
  const [venueCount, setVenueCount] = useState(20);
  const { deals: allDeals = [] } = useAllDeals();

  // Load price, pass count, and venue count once at parent level
  useEffect(() => {
    const loadData = async () => {
      const [price, count, features] = await Promise.all([
        getPassPrice(), 
        getPassCount(),
        getPassFeatures()
      ]);
      setPassPrice(price);
      setPassCount(count);
      setVenueCount(features.venueCount || 20);
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
                deals={allDeals.filter((deal) => deal.category === 'restaurant')}
                redeemedDeals={[]}
                onRedeemClick={() => onBuyPassClick?.() || onMainCtaClick()}
                hasPass={false}
                onBuyPassClick={onBuyPassClick || onMainCtaClick}
              />
              <HorizontalCategoryRow
                title="Activities & Adventure"
                emoji="🛶"
                description="Unforgettable experiences in Port Alfred"
                deals={allDeals.filter((deal) => deal.category === 'activity')}
                redeemedDeals={[]}
                onRedeemClick={() => onBuyPassClick?.() || onMainCtaClick()}
                hasPass={false}
                onBuyPassClick={onBuyPassClick || onMainCtaClick}
              />
            <HorizontalCategoryRow
              title="Lifestyle & Wellness"
              emoji="✨"
              description="Local shops, spas, and wellness"
              deals={allDeals.filter((deal) => deal.category === 'shopping')}
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

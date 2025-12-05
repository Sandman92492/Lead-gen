import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import TrustBar from './TrustBar';
import CharitySection from './CharitySection';
import HowItWorks from './HowItWorks';
import DealsDirectoryV2 from '../pages/DealsDirectoryV2';
import FAQ from './FAQ';
import PricingOptions from './PricingOptions';
import { PassType } from '../types';
import { getPassPrice, getPassCount, getPassFeatures } from '../utils/pricing';

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
      <main>
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
        <DealsDirectoryV2 
          hasPass={false} 
          onRedeemClick={() => onBuyPassClick?.() || onMainCtaClick()} 
          redeemedDeals={[]} 
          onBuyPassClick={onBuyPassClick || onMainCtaClick}
        />
        <FAQ />
        <PricingOptions onSelectPass={onSelectPass} passPrice={passPrice} />
      </main>
    </>
  );
};

export default FreeUserView;

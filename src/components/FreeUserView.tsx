import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import TrustBar from './TrustBar';
import CharitySection from './CharitySection';
import HowItWorks from './HowItWorks';
import DealsShowcase from './DealsShowcase';
import FAQ from './FAQ';
import PricingOptions from './PricingOptions';
import { PassType } from '../types';
import { getPassPrice, getPassCount, getPassFeatures } from '../utils/pricing';

interface FreeUserViewProps {
  onSelectPass: (passType: PassType) => void;
  onActivateClick: () => void;
  onMainCtaClick: () => void;
  onAuthClick?: () => void;
}

const FreeUserView: React.FC<FreeUserViewProps> = ({
  onSelectPass,
  onActivateClick,
  onMainCtaClick,
  onAuthClick,
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
        <DealsShowcase hasPass={false} onRedeemClick={() => {}} redeemedDeals={[]} isFreeUser={true} onSignInClick={onAuthClick} />
        <FAQ />
        <PricingOptions onSelectPass={onSelectPass} passPrice={passPrice} />
      </main>
    </>
  );
};

export default FreeUserView;

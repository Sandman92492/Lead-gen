import React from 'react';
import Hero from './Hero';
import WelcomeSection from './WelcomeSection';
import HowItWorks from './HowItWorks';
import DealsShowcase from './DealsShowcase';
import CharitySection from './CharitySection';
import FAQ from './FAQ';
import PricingOptions from './PricingOptions';
import { PassType } from '../types';

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
  return (
    <main>
      <Hero
        onButtonClick={onMainCtaClick}
        buttonText="Get My Holiday Pass Now"
        passHolderName={null}
        onActivateClick={onActivateClick}
        appStatus="guest"
      />
      <WelcomeSection variant="intro" />
      <HowItWorks />
      <DealsShowcase hasPass={false} onRedeemClick={() => {}} redeemedDeals={[]} isFreeUser={true} onSignInClick={onAuthClick} />
      <CharitySection />
      <FAQ />
      <PricingOptions onSelectPass={onSelectPass} />
    </main>
  );
};

export default FreeUserView;

import React from 'react';
import WelcomeSection from './WelcomeSection';
import DealsShowcase from './DealsShowcase';
import FullDealList from './FullDealList';
import Button from './Button';

interface SignedInViewProps {
  onPurchaseClick: () => void;
  onRedeemClick: (dealName: string) => void;
}

const SignedInView: React.FC<SignedInViewProps> = ({
  onPurchaseClick,
  onRedeemClick,
}) => {
  return (
    <main>
      <section className="py-12 sm:py-16 bg-bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-black text-text-primary mb-4">
            Browse All Deals
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            Sign up for a pass to start redeeming exclusive savings at our partner venues
          </p>
          <Button variant="primary" onClick={onPurchaseClick} className="inline-block">
            Get Holiday Pass
          </Button>
        </div>
      </section>

      <WelcomeSection variant="welcome" />

      <DealsShowcase hasPass={false} onRedeemClick={onRedeemClick} redeemedDeals={[]} />
      <FullDealList hasPass={false} onRedeemClick={onRedeemClick} redeemedDeals={[]} />
    </main>
  );
};

export default SignedInView;

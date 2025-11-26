import React from 'react';
import DealsShowcase from '../components/DealsShowcase';

interface HeavyHittersPageProps {
  hasPass: boolean;
  onRedeemClick: (dealName: string) => void;
  redeemedDeals: string[];
}

const HeavyHittersPage: React.FC<HeavyHittersPageProps> = ({ hasPass, onRedeemClick, redeemedDeals }) => {
  return (
    <main className="pb-20 sm:pb-12">
      <DealsShowcase hasPass={hasPass} onRedeemClick={onRedeemClick} redeemedDeals={redeemedDeals} />
    </main>
  );
};

export default HeavyHittersPage;

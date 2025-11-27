import React from 'react';
import DealsShowcase from '../components/DealsShowcase';

interface HeavyHittersPageProps {
  hasPass: boolean;
  onRedeemClick: (dealName: string) => void;
  redeemedDeals: string[];
  passExpiryDate?: string;
}

const HeavyHittersPage: React.FC<HeavyHittersPageProps> = ({ hasPass, onRedeemClick, redeemedDeals, passExpiryDate }) => {
  return (
    <main className="pb-20 sm:pb-12">
      <DealsShowcase hasPass={hasPass} onRedeemClick={onRedeemClick} redeemedDeals={redeemedDeals} passExpiryDate={passExpiryDate} />
    </main>
  );
};

export default HeavyHittersPage;

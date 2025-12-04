import React, { useState, useEffect } from 'react';
import DealsShowcase from './DealsShowcase';
import FullDealList from './FullDealList';
import Button from './Button';
import { useAllDeals } from '../hooks/useAllDeals';
import { getPassCount, getPassPrice } from '../utils/pricing';

interface SignedInViewProps {
  onPurchaseClick: () => void;
  onRedeemClick: (dealName: string) => void;
}

const SignedInView: React.FC<SignedInViewProps> = ({
  onPurchaseClick,
  onRedeemClick,
}) => {
  const { deals } = useAllDeals();
  const [passCount, setPassCount] = useState(0);
  const [passPrice, setPassPrice] = useState(199);

  // Calculate total savings from all deals
  const totalSavings = deals.reduce((sum, deal) => sum + (deal.savings || 0), 0);
  const roundedSavings = Math.floor(totalSavings / 100) * 100;

  useEffect(() => {
    const loadData = async () => {
      const [count, price] = await Promise.all([getPassCount(), getPassPrice()]);
      setPassCount(count);
      setPassPrice(price.price);
    };
    loadData();
  }, []);

  return (
    <main>
      <section className="py-12 sm:py-16 bg-bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-black text-action-primary mb-4">
            Unlock R{roundedSavings.toLocaleString()}+ in Savings
          </h1>
          <p className="text-lg text-text-secondary mb-6">
            You're signed in—now get the pass to start redeeming at our partner venues.
          </p>
          {passCount > 0 && (
            <p className="text-sm text-text-secondary mb-6">
              Join {passCount}+ others already saving this summer
            </p>
          )}
          <Button variant="primary" onClick={onPurchaseClick} className="inline-block">
            Get Holiday Pass – R{passPrice}
          </Button>
        </div>
      </section>

      <DealsShowcase hasPass={false} onRedeemClick={onRedeemClick} redeemedDeals={[]} />
      <FullDealList hasPass={false} onRedeemClick={onRedeemClick} redeemedDeals={[]} />
    </main>
  );
};

export default SignedInView;

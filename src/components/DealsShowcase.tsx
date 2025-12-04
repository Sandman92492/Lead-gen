import React from 'react';
import { useAllDeals } from '../hooks/useAllDeals';
import CompactDealCard from './CompactDealCard';

interface DealsShowcaseProps {
    hasPass: boolean;
    redeemedDeals?: string[];
    passExpiryDate?: string; // Pass expiry date to check if expired
    onRedeemClick?: (dealName: string) => void;
    isFreeUser?: boolean;
    onSignInClick?: () => void;
}

const DealsShowcase: React.FC<DealsShowcaseProps> = ({ hasPass, redeemedDeals = [], passExpiryDate, onRedeemClick, isFreeUser = false, onSignInClick }) => {
  const { deals: allDeals, isLoading } = useAllDeals();
  
  let deals;
  if (isFreeUser) {
    // For free users: show top 4 deals by savings (from all deals, not just featured)
    deals = [...allDeals].sort((a, b) => (b.savings || 0) - (a.savings || 0)).slice(0, 4);
  } else {
    // For other users: show featured deals
    deals = allDeals.filter(deal => deal.featured);
  }

  const isRedeemed = (dealName: string) => redeemedDeals.includes(dealName);

  return (
    <section id="deals-showcase" className="bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6 relative py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 md:mb-5">
            Featured Deals
          </h2>
          <p className="text-3xl md:text-4xl font-display font-black text-action-primary mb-4 md:mb-6">Unlock These Deals</p>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 md:mb-10">
            Real savings at places locals actually go.
          </p>
        </div>

        {isLoading && (
          <p className="text-center text-text-secondary">Loading featured deals...</p>
        )}

        {!isLoading && deals.length === 0 && (
          <p className="text-center text-text-secondary">No featured deals yet. Check back soon!</p>
        )}

        {!isLoading && deals.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {deals.map((deal, index) => (
                <CompactDealCard
                  key={deal.name}
                  deal={deal}
                  index={index}
                  isRedeemed={isRedeemed(deal.name)}
                  hasPass={hasPass}
                  passExpiryDate={passExpiryDate}
                  onClick={() => onRedeemClick?.(deal.name)}
                  isInGrid={true}
                />
              ))}
            </div>
            {isFreeUser && onSignInClick && (
               <div className="text-center mt-12">
                 <button
                   onClick={onSignInClick}
                   className="bg-action-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-action-primary/90 transition-colors"
                 >
                   Sign in to see all {allDeals.length} deals →
                 </button>
               </div>
             )}
          </>
        )}
      </div>
    </section>
  );
};

export default DealsShowcase;

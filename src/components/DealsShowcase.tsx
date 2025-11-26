import React from 'react';
import { useAllDeals } from '../hooks/useAllDeals';
import FeaturedDealCard from './FeaturedDealCard';

interface DealsShowcaseProps {
    hasPass: boolean;
    redeemedDeals?: string[];
    onRedeemClick?: (dealName: string) => void;
    isFreeUser?: boolean;
    onSignInClick?: () => void;
}

const DealsShowcase: React.FC<DealsShowcaseProps> = ({ hasPass, redeemedDeals = [], onRedeemClick, isFreeUser = false, onSignInClick }) => {
  const { deals: allDeals, isLoading } = useAllDeals();
  let deals = allDeals.filter(deal => deal.featured);
  
  // Limit to 3 deals for free users
  if (isFreeUser) {
    deals = deals.slice(0, 3);
  }

  const isRedeemed = (dealName: string) => redeemedDeals.includes(dealName);

  return (
    <section id="deals-showcase" className="bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6 relative py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 md:mb-5">
            Featured Deals
          </h2>
          <p className="text-3xl md:text-4xl font-display font-black text-accent-primary mb-4 md:mb-6">The Heavy Hitters</p>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 md:mb-10">
            Get the best savings at Port Alfred's premier venues
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal, index) => (
                <FeaturedDealCard
                  key={deal.name}
                  deal={deal}
                  index={index}
                  hasPass={hasPass}
                  isRedeemed={isRedeemed(deal.name)}
                  onRedeemClick={onRedeemClick}
                  cardHeight="h-96"
                />
              ))}
            </div>
            {isFreeUser && (
              <div className="text-center mt-12">
                <p className="text-text-secondary mb-4">
                  Interested in more deals? Sign in to browse all available offers.
                </p>
                <button
                  onClick={onSignInClick}
                  className="text-action-primary font-semibold hover:underline"
                >
                  Sign in to view all deals
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

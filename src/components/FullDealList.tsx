import React from 'react';
import { useAllDeals } from '../hooks/useAllDeals';
import CategoryDealScroller from './CategoryDealScroller';
import { isPassExpired as checkPassExpiry } from '../utils/passExpiry';

interface FullDealListProps {
  hasPass: boolean;
  redeemedDeals?: string[];
  passExpiryDate?: string; // Pass expiry date to check if expired
  onRedeemClick?: (dealName: string) => void;
  isFreeUser?: boolean;
  onAuthClick?: () => void;
  onBuyPassClick?: () => void;
}

const FullDealList: React.FC<FullDealListProps> = ({
  hasPass,
  redeemedDeals = [],
  passExpiryDate,
  onRedeemClick,
  onBuyPassClick,
}) => {
  const { deals: allDeals, isLoading } = useAllDeals();
  const isPassExpired = passExpiryDate ? checkPassExpiry(passExpiryDate) : false;

  // Show all deals in new layout (ignore featured flag for smooth transition)
  const regularDeals = allDeals;
  
  const filteredDeals = regularDeals;

  return (
    <section id="full-deal-list" className="bg-bg-primary relative">
      {isPassExpired && hasPass && (
        <div className="bg-red-50 dark:bg-red-950/30 border-t border-b border-red-200 dark:border-red-800 py-4">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200">Your pass has expired</p>
                <p className="text-sm text-red-800 dark:text-red-300">Purchase a new pass to access exclusive deals</p>
              </div>
              <button
                onClick={onBuyPassClick}
                className="flex-shrink-0 px-6 py-2 bg-urgency-high text-white font-bold rounded-md hover:brightness-110 transition-all whitespace-nowrap"
              >
                Get New Pass
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-black text-action-primary mb-2">
            All Deals
          </h1>
          <p className="text-text-secondary">
            Browse all {allDeals.length} exclusive deals in Port Alfred & Surroundings
          </p>
        </div>

        {isLoading && (
          <p className="text-center text-text-secondary">Loading deals...</p>
        )}

        {!isLoading && allDeals.length === 0 && (
          <p className="text-center text-text-secondary">
            No deals available yet.
          </p>
        )}



        {/* Category Deal Scrollers */}
        {!isLoading && filteredDeals.length > 0 && (
          <>
            <CategoryDealScroller
              title="Local Eats & Treats"
              emoji="🍔"
              deals={filteredDeals.filter(
                (deal) =>
                  deal.category === 'restaurant' &&
                  !redeemedDeals.includes(deal.name)
              )}
              redeemedDeals={redeemedDeals}
              passExpiryDate={passExpiryDate}
              onRedeemClick={onRedeemClick}
              hasPass={hasPass}
            />
            <CategoryDealScroller
              title="Activities & Adventure"
              emoji="🛶"
              deals={filteredDeals.filter(
                (deal) =>
                  deal.category === 'activity' &&
                  !redeemedDeals.includes(deal.name)
              )}
              redeemedDeals={redeemedDeals}
              passExpiryDate={passExpiryDate}
              onRedeemClick={onRedeemClick}
              hasPass={hasPass}
            />
            <CategoryDealScroller
              title="Lifestyle & Wellness"
              emoji="✨"
              deals={filteredDeals.filter(
                (deal) =>
                  deal.category === 'shopping' &&
                  !redeemedDeals.includes(deal.name)
              )}
              redeemedDeals={redeemedDeals}
              passExpiryDate={passExpiryDate}
              onRedeemClick={onRedeemClick}
              hasPass={hasPass}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default FullDealList;

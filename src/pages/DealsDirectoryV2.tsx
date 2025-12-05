import React, { useState, useMemo } from 'react';
import { useAllDeals } from '../hooks/useAllDeals';
import { isPassExpired as checkPassExpiry } from '../utils/passExpiry';
import CompactDealCard from '../components/CompactDealCard';

interface DealsDirectoryV2Props {
  hasPass: boolean;
  onRedeemClick: (dealName: string) => void;
  redeemedDeals: string[];
  passExpiryDate?: string;
  onBuyPassClick?: () => void;
}

type CategoryFilter = 'all' | 'restaurant' | 'activity' | 'shopping';

const DealsDirectoryV2: React.FC<DealsDirectoryV2Props> = ({
  hasPass,
  onRedeemClick,
  redeemedDeals = [],
  passExpiryDate,
  onBuyPassClick,
}) => {
  const { deals: allDeals, isLoading } = useAllDeals();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  
  const isPassExpired = passExpiryDate ? checkPassExpiry(passExpiryDate) : false;

  // Filter logic: category + exclude redeemed
  const filteredDeals = useMemo(() => {
    let filtered = allDeals;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((deal) => deal.category === selectedCategory);
    }

    // Exclude redeemed deals
    filtered = filtered.filter((deal) => !redeemedDeals.includes(deal.name));

    return filtered;
  }, [allDeals, selectedCategory, redeemedDeals]);

  // Filter pill options
  const filterOptions: Array<{
    label: string;
    emoji: string;
    value: CategoryFilter;
  }> = [
    { label: 'All', emoji: '✨', value: 'all' },
    { label: 'Eat', emoji: '🍔', value: 'restaurant' },
    { label: 'Play', emoji: '🛶', value: 'activity' },
    { label: 'Shop', emoji: '🛍️', value: 'shopping' },
  ];

  return (
    <>
      {/* Pass Expired Banner */}
      {isPassExpired && hasPass && (
        <div className="bg-red-50 dark:bg-red-950/30 border-t border-b border-red-200 dark:border-red-800 py-4">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200">
                  Your pass has expired
                </p>
                <p className="text-sm text-red-800 dark:text-red-300">
                  Purchase a new pass to access exclusive deals
                </p>
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

      <section id="deals-directory-v2" className="bg-bg-primary relative pb-24 md:pb-12">
         <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
           {/* Hero Heading */}
           <div className="text-center mb-10">
             <h1 className="text-3xl md:text-4xl font-display font-black text-action-primary mb-4">
               All Deals
             </h1>
             <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
               Browse {allDeals.length}+ local deals. Get your pass to unlock them all.
             </p>
           </div>

           {/* Filter Pills Row - Emoji Only */}
           <div className="mb-10 flex justify-center gap-6 sm:gap-8">
             {filterOptions.map((option) => (
               <button
                 key={option.value}
                 onClick={() => setSelectedCategory(option.value)}
                 className={`
                   w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 border-2
                   ${
                     selectedCategory === option.value
                       ? 'bg-action-primary border-action-primary shadow-lg shadow-action-primary/30 scale-110'
                       : 'bg-bg-card border-border-subtle hover:border-action-primary/40 hover:shadow-md hover:scale-105'
                   }
                 `}
                 aria-pressed={selectedCategory === option.value}
                 title={option.label}
               >
                 <span className="text-4xl sm:text-5xl">{option.emoji}</span>
               </button>
             ))}
           </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-text-secondary">Loading deals...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredDeals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">
                {selectedCategory === 'all'
                  ? 'No deals available yet.'
                  : `No deals found in this category.`}
              </p>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-action-primary hover:text-action-primary/80 font-semibold"
                >
                  View all deals
                </button>
              )}
            </div>
          )}

          {/* 2-Column Grid */}
          {!isLoading && filteredDeals.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {filteredDeals.map((deal, index) => (
                <div key={deal.id || index} className="flex justify-center items-start">
                  <CompactDealCard
                    deal={deal}
                    index={index}
                    isRedeemed={redeemedDeals.includes(deal.name)}
                    onClick={() => onRedeemClick(deal.name)}
                    isInGrid={true}
                    hasPass={hasPass}
                    passExpiryDate={passExpiryDate}
                    onBuyPassClick={onBuyPassClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DealsDirectoryV2;

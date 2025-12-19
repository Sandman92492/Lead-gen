import React, { useRef, useState } from 'react';
import { Deal } from '../types';
import CompactDealCard from './CompactDealCard';

interface HorizontalCategoryRowProps {
  title: string;
  emoji: string;
  deals: Deal[];
  redeemedDeals?: string[];
  onRedeemClick?: (dealName: string) => void;
  description?: string;
  hasPass?: boolean;
  passExpiryDate?: string;
  onBuyPassClick?: () => void;
}

/**
 * HorizontalCategoryRow - Netflix-style horizontal scroll row
 * Modern, compact layout with thumbnail cards
 * - Category title + emoji
 * - Horizontal scrollable row
 * - CompactDealCard components (140x160px)
 * - Smooth scrolling with scroll indicators
 */
const HorizontalCategoryRow: React.FC<HorizontalCategoryRowProps> = ({
  title,
  emoji,
  deals,
  redeemedDeals = [],
  onRedeemClick,
  description,
  hasPass,
  passExpiryDate,
  onBuyPassClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    if (!deals || deals.length === 0) return;
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [deals]);

  // Safety check for undefined/empty deals - AFTER all hooks
  if (!deals || deals.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-bg-primary py-6 md:py-8 border-b border-border-subtle">
      <div className="container-px container mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between px-2">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-display font-black text-action-primary flex items-center gap-2 mb-1">
                <span className="text-2xl md:text-3xl">{emoji}</span>
                <span>{title}</span>
              </h2>
              {description && (
                <p className="text-sm text-text-secondary">{description}</p>
              )}
            </div>

            {/* Scroll Buttons - Desktop/Tablet */}
            <div className="hidden sm:flex gap-2 ml-4 flex-shrink-0">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="p-2 rounded-[var(--r-md)] bg-border-subtle hover:bg-border-subtle/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Scroll left"
              >
                <svg
                  className="w-5 h-5 text-text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="p-2 rounded-[var(--r-md)] bg-border-subtle hover:bg-border-subtle/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Scroll right"
              >
                <svg
                  className="w-5 h-5 text-text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            {/* Left gradient fade (mobile) */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
            )}

            {/* Right gradient fade (mobile) */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />
            )}

            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth px-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="flex gap-4 pb-2">
                {deals.map((deal) => (
                   <CompactDealCard
                     key={deal.id || deal.name}
                     deal={deal}
                     index={0}
                     isRedeemed={redeemedDeals.includes(deal.name)}
                     onClick={onRedeemClick ? () => onRedeemClick(deal.name) : undefined}
                     hasPass={hasPass}
                     passExpiryDate={passExpiryDate}
                     onBuyPassClick={onBuyPassClick}
                   />
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalCategoryRow;

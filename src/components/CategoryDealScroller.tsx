import React, { useRef, useState } from 'react';
import { Deal } from '../types';
import FeaturedDealCard from './FeaturedDealCard';
import './CategoryDealScroller.css';

interface CategoryDealScrollerProps {
  title: string;
  emoji: string;
  deals: Deal[];
  redeemedDeals?: string[];
  passExpiryDate?: string;
  onRedeemClick?: (dealName: string) => void;
  hasPass: boolean;
}

const CategoryDealScroller: React.FC<CategoryDealScrollerProps> = ({
  title,
  emoji,
  deals,
  redeemedDeals = [],
  passExpiryDate,
  onRedeemClick,
  hasPass,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      
      // Update current index based on scroll position
      const cardWidth = clientWidth;
      const gap = 16;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.min(newIndex, deals.length - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth;
      const gap = 16;
      const scrollAmount = cardWidth + gap;
      
      container.scrollTo({
        left: index * scrollAmount,
        behavior: 'smooth',
      });
      
      setTimeout(checkScroll, 300);
    }
  };

  React.useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [deals.length]);

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="bg-bg-primary py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Title */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-action-primary flex items-center gap-2 leading-tight">
              <span className="flex-shrink-0">{emoji}</span>
              <span className="truncate">{title}</span>
            </h2>
            <div className="text-sm font-semibold text-text-secondary">
              {currentIndex + 1} of {deals.length}
            </div>
          </div>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scroll-smooth scrollbar-hide"
            style={{ scrollBehavior: 'smooth', scrollSnapType: 'x mandatory' }}
          >
            <div className="flex gap-4 pb-4">
              {deals.map((deal, index) => (
                <div
                  key={deal.id || deal.name}
                  className="flex-shrink-0 w-full"
                  style={{ scrollSnapAlign: 'center' }}
                >
                  <FeaturedDealCard
                    deal={deal}
                    index={index}
                    hasPass={hasPass}
                    isRedeemed={redeemedDeals.includes(deal.name)}
                    passExpiryDate={passExpiryDate}
                    onRedeemClick={onRedeemClick}
                    cardHeight="h-80"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {deals.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`transition-all duration-200 rounded-full ${
                  index === currentIndex
                    ? 'bg-action-primary w-3 h-3'
                    : 'bg-border-subtle hover:bg-text-secondary/30 w-2 h-2'
                }`}
                aria-label={`Go to deal ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryDealScroller;

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
  const touchStartRef = useRef({ x: 0, y: 0 });

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

  // Handle swipes to move one card at a time
  const handleTouchStart = (e: TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    const currentTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    const deltaX = currentTouch.x - touchStartRef.current.x;
    const deltaY = currentTouch.y - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Only prevent vertical scroll if significant horizontal movement detected
    const isHorizontal = absDeltaX > absDeltaY * 1.5 && absDeltaX > 10;
    if (isHorizontal && e.cancelable) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Only trigger if primarily horizontal (1.5x more than vertical)
    const isHorizontal = absDeltaX > absDeltaY * 1.5;

    if (isHorizontal && absDeltaX > 20) {
      if (deltaX > 0) {
        // Swiped right - go to previous card
        scrollToIndex(Math.max(0, currentIndex - 1));
      } else {
        // Swiped left - go to next card
        scrollToIndex(Math.min(deals.length - 1, currentIndex + 1));
      }
    }
  };

  React.useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      container.addEventListener('touchstart', handleTouchStart, false);
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, false);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [deals.length, currentIndex]);

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
             className="overflow-x-auto scrollbar-hide"
             style={{ scrollSnapType: 'x mandatory', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
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

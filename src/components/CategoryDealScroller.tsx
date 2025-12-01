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
  description?: string;
}

const CategoryDealScroller: React.FC<CategoryDealScrollerProps> = ({
  title,
  emoji,
  deals,
  redeemedDeals = [],
  passExpiryDate,
  onRedeemClick,
  hasPass,
  description,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTabletOrLarger, setIsTabletOrLarger] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

  // Detect tablet/desktop breakpoint
  React.useEffect(() => {
    const handleResize = () => {
      setIsTabletOrLarger(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const cardWidth = clientWidth;
      const gap = 16;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      
      // Update current index based on scroll position (just for dots)
      setCurrentIndex(Math.min(newIndex, deals.length - 1));
    }
  };

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && !isTabletOrLarger) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [deals.length, isTabletOrLarger]);

  if (deals.length === 0) {
    return null;
  }

  // Grid on tablet/desktop
  if (isTabletOrLarger) {
    return (
      <section className="bg-bg-primary py-8 md:py-12 lg:py-16 border-t border-border-subtle">
        <div className="container-px container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-action-primary flex items-center gap-3 mb-4">
                <span className="text-3xl md:text-4xl lg:text-5xl">{emoji}</span>
                <span>{title}</span>
              </h2>
              {description && (
                <p className="text-text-primary text-base md:text-lg">{description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {deals.map((deal, index) => (
                <div key={deal.id || deal.name} className="scroll-reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                  <FeaturedDealCard
                    deal={deal}
                    index={index}
                    hasPass={hasPass}
                    isRedeemed={redeemedDeals.includes(deal.name)}
                    passExpiryDate={passExpiryDate}
                    onRedeemClick={onRedeemClick}
                    cardHeight="h-96"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Carousel on mobile
  return (
    <section className="bg-bg-primary py-8 sm:py-10 md:py-12 border-t border-border-subtle">
      <div className="container-px container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-action-primary flex items-center gap-2 leading-tight">
              <span>{emoji}</span>
              <span className="truncate">{title}</span>
            </h2>
            <div className="text-xs xs:text-sm font-semibold text-text-secondary">
              {currentIndex + 1}/{deals.length}
            </div>
          </div>

          {description && (
            <p className="text-text-secondary text-sm sm:text-base md:text-lg mb-6">{description}</p>
          )}

          <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide" style={{scrollBehavior: 'smooth', scrollSnapType: 'x mandatory'}}>
            <div className="flex gap-3 xs:gap-4 pb-4">
              {deals.map((deal, index) => (
                <div key={deal.id || deal.name} className="flex-shrink-0 w-full" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
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

          <div className="flex justify-center items-center gap-2 mt-4 xs:mt-5">
            {deals.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (scrollContainerRef.current) {
                    const scrollAmount = scrollContainerRef.current.clientWidth + 16;
                    scrollContainerRef.current.scrollTo({left: index * scrollAmount, behavior: 'smooth'});
                    setCurrentIndex(index);
                  }
                }}
                className={`transition-all rounded-full ${index === currentIndex ? 'bg-action-primary w-2.5 xs:w-3 h-2.5 xs:h-3' : 'bg-border-subtle w-2 h-2'}`}
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

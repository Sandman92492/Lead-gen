import React, { useState, useEffect } from 'react';
import Button from './Button';

interface StickyMobileCTAProps {
  price: number;
  onBuyClick: () => void;
}

const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({ price, onBuyClick }) => {
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero CTA button (roughly 90vh)
      const scrollThreshold = window.innerHeight * 0.9;
      setShowBar(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-bg-card/95 backdrop-blur-sm border-b border-border-subtle shadow-lg transition-transform duration-300 ${
        showBar ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">Holiday Pass</p>
          <p className="text-xs text-text-secondary">Unlock R1,000+ in savings</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onBuyClick}
          className="flex-shrink-0"
        >
          Get Pass – R{price}
        </Button>
      </div>
    </div>
  );
};

export default StickyMobileCTA;

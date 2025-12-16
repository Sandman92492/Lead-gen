

import React, { useState, useEffect } from 'react';
import Button from './Button.tsx';
import { getPassPrice, getLaunchPricingData } from '../utils/pricing';
import { useAllDeals } from '../hooks/useAllDeals';

interface HeroProps {
  onButtonClick: () => void;
  buttonText: string;
  passHolderName: string | null;
  onActivateClick: () => void;
  appStatus: 'loading' | 'validated' | 'guest';
  passPrice?: number;
  passCount?: number;
}

const Hero: React.FC<HeroProps> = ({ onButtonClick, buttonText, onActivateClick: _onActivateClick, appStatus, passPrice: propPassPrice }) => {
  const [localPassPrice, setLocalPassPrice] = useState(199);
  const [totalSavings, setTotalSavings] = useState(1000);
  const [launchData, setLaunchData] = useState<{ passesRemaining: number; isLaunchPricing: boolean } | null>(null);
  const { deals } = useAllDeals();
  const isLoading = appStatus === 'loading';
  const mainButtonText = isLoading ? 'Checking Ticket Pack...' : buttonText;

  // Use prop if provided, otherwise fetch locally
  const passPrice = propPassPrice ?? localPassPrice;

  useEffect(() => {
    const loadData = async () => {
      if (propPassPrice === undefined) {
        const price = await getPassPrice();
        setLocalPassPrice(price.price);
      }
      // Always fetch launch data for passes remaining
      const launch = await getLaunchPricingData();
      setLaunchData(launch);
    };
    loadData();
  }, [propPassPrice]);

  // Calculate total savings from all deals, rounded down to nearest hundred
  useEffect(() => {
    if (deals.length > 0) {
      const total = deals.reduce((sum, deal) => sum + (deal.savings || 0), 0);
      const roundedTotal = Math.floor(total / 100) * 100;
      setTotalSavings(roundedTotal);
    }
  }, [deals]);

  const imageUrl = "/Images/welcomev3.webp";

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-start md:justify-center text-center overflow-hidden">
         {/* Image background for all devices */}
         <div
           className="absolute inset-0 bg-cover bg-center bg-fixed z-0"
           style={{
             backgroundImage: `url('${imageUrl}')`,
             backgroundAttachment: 'fixed'
           }}
         />

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60 z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 pt-24 md:pt-16 relative z-10 flex flex-col items-center">
           <div className="max-w-3xl mx-auto scroll-reveal">
               <h2 className="text-xs md:text-sm font-semibold text-value-highlight uppercase tracking-[0.25em] mb-3 md:mb-4 drop-shadow-sm flex items-center justify-center gap-2">
                   <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2C7.13 2 3 6.13 3 11c0 5.25 9 13 9 13s9-7.75 9-13c0-4.87-4.13-9-9-9zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                   </svg>
                   School & NPO Fundraisers
               </h2>
               <h1 className="font-display text-white leading-tight mb-8 md:mb-10 drop-shadow-lg">
                   <span className="block text-4xl md:text-6xl font-black tracking-tight">
                     Support the school.
                     <span className="block text-value-highlight">Win prizes.</span>
                   </span>
               </h1>
               <p className="text-base md:text-lg text-white/90 leading-relaxed mb-6 drop-shadow-lg max-w-xl mx-auto">
                   Get a ticket pack to enter raffle prizes and support verified school & NPO fundraisers. Over R{totalSavings.toLocaleString()}+ in prize value.
               </p>

               <div className="flex flex-col items-center gap-6">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="px-12 transform transition-transform duration-300 hover:scale-105 animate-subtle-pulse disabled:animate-none disabled:bg-gray-500" 
                    onClick={onButtonClick}
                    disabled={isLoading}
                  >
                      {isLoading ? mainButtonText : `Get the Ticket Pack – R${passPrice}`}
                  </Button>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-white/80 text-xs md:text-sm drop-shadow-md">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" aria-hidden="true" />
                      Secure checkout
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" aria-hidden="true" />
                      Verified entries
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" aria-hidden="true" />
                      Instant digital access
                    </span>
                  </div>
                  
                  {/* Urgency line */}
                  {launchData?.isLaunchPricing && launchData.passesRemaining > 0 && (
                    <p className="text-white/80 text-xs md:text-sm drop-shadow-md">
                      <span className="text-value-highlight font-semibold">
                        Limited-time supporter pricing.
                      </span>
                    </p>
                  )}
                  
                  {/* Subtle scroll down arrow */}
                  <div className="mt-12 opacity-60" style={{ animation: 'gentle-bob 2.5s ease-in-out infinite' }}>
                   <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                     <path d="M12 5v14M19 12l-7 7m0 0l-7-7" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                  </div>
                  <style>{`
                   @keyframes gentle-bob {
                     0%, 100% { transform: translateY(0px); }
                     50% { transform: translateY(8px); }
                   }
                  `}</style>
               </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;



import React, { useState, useEffect } from 'react';
import Button from './Button.tsx';
import { getPassPrice } from '../utils/pricing';
import { useAllDeals } from '../hooks/useAllDeals';

interface HeroProps {
  onButtonClick: () => void;
  buttonText: string;
  passHolderName: string | null;
  onActivateClick: () => void;
  appStatus: 'loading' | 'validated' | 'guest';
}

const Hero: React.FC<HeroProps> = ({ onButtonClick, buttonText, onActivateClick: _onActivateClick, appStatus }) => {
  const [passPrice, setPassPrice] = useState(199);
  const [totalSavings, setTotalSavings] = useState(1000);
  const { deals } = useAllDeals();
  const isLoading = appStatus === 'loading';
  const mainButtonText = isLoading ? 'Checking Pass...' : buttonText;

  useEffect(() => {
    const loadPrice = async () => {
      const price = await getPassPrice();
      setPassPrice(price.price);
    };
    loadPrice();
  }, []);

  // Calculate total savings from all deals, rounded down to nearest hundred
  useEffect(() => {
    if (deals.length > 0) {
      const total = deals.reduce((sum, deal) => sum + (deal.savings || 0), 0);
      const roundedTotal = Math.floor(total / 100) * 100;
      setTotalSavings(roundedTotal);
    }
  }, [deals]);

  const imageUrl = "/Images/herov2.jpg";

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
               <h2 className="text-sm md:text-base font-semibold text-white uppercase tracking-widest mb-4 md:mb-5 drop-shadow-sm flex items-center justify-center gap-2">
                   <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2C7.13 2 3 6.13 3 11c0 5.25 9 13 9 13s9-7.75 9-13c0-4.87-4.13-9-9-9zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                   </svg>
                   Port Alfred Holiday Pass
               </h2>
               <h1 className="font-display text-white leading-tight mb-12 md:mb-16 drop-shadow-lg">
                   <span className="block text-2xl md:text-4xl font-normal">Holiday Like a <span className="font-bold text-yellow-300">Local</span> on</span>
                   <span className="block text-5xl md:text-7xl font-black">SA's Blue Flag Coast</span>
               </h1>
               <p className="text-lg md:text-xl text-white leading-relaxed mb-6 drop-shadow-lg max-w-2xl">
                   Don't pay peak season prices. <span className="font-bold text-yellow-300">Pay Like a Local.</span> Unlock R{totalSavings.toLocaleString()}+ in exclusive savings at Port Alfred's best spots.
               </p>

               <div className="flex flex-col items-center gap-8">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="px-12 transform transition-transform duration-300 hover:scale-105 animate-subtle-pulse disabled:animate-none disabled:bg-gray-500" 
                    onClick={onButtonClick}
                    disabled={isLoading}
                  >
                      {isLoading ? mainButtonText : `Get the Pass – R${passPrice}`}
                  </Button>
                  
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

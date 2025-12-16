import React, { useState, useEffect } from 'react';
import Button from './Button.tsx';
import { getLaunchPricingData } from '../utils/pricing';

interface HeroProps {
  onButtonClick: () => void;
  buttonText: string;
  passHolderName: string | null;
  onActivateClick: () => void;
  appStatus: 'loading' | 'validated' | 'guest';
  venueCount?: number;
}

const Hero: React.FC<HeroProps> = ({ onButtonClick, buttonText, onActivateClick: _onActivateClick, appStatus, venueCount = 0 }) => {
  const [launchData, setLaunchData] = useState<{ passesRemaining: number; isLaunchPricing: boolean } | null>(null);
  const isLoading = appStatus === 'loading';
  const mainButtonText = isLoading ? 'Checking Pass...' : buttonText;

  useEffect(() => {
    const loadData = async () => {
      // Always fetch launch data for passes remaining
      const launch = await getLaunchPricingData();
      setLaunchData(launch);
    };
    loadData();
  }, []);

  const imageUrl = "/Images/welcomev3.webp";
  const trustedText = venueCount > 0 ? `Trusted by ${venueCount}+ local businesses` : 'Trusted by local businesses';

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-start md:justify-center text-center overflow-hidden">
        {/* Hero background image */}
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60 z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 pt-24 md:pt-16 relative z-10 flex flex-col items-center">
           <div className="max-w-3xl mx-auto scroll-reveal">
               <h2 className="text-xs md:text-sm font-semibold text-yellow-300 uppercase tracking-[0.25em] mb-3 md:mb-4 drop-shadow-sm flex items-center justify-center gap-2">
                   <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2C7.13 2 3 6.13 3 11c0 5.25 9 13 9 13s9-7.75 9-13c0-4.87-4.13-9-9-9zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                   </svg>
                   Port Alfred Holiday Pass
               </h2>
               <h1 className="font-display text-white leading-[1.05] tracking-tight mb-5 md:mb-6 drop-shadow-lg text-balance">
                 <span className="block text-3xl sm:text-4xl md:text-5xl font-black">
                   One pass. Big local savings.
                 </span>
               </h1>
               <p className="text-base md:text-lg text-white/90 leading-relaxed mb-6 drop-shadow-lg max-w-xl mx-auto">
                 Instant discounts & freebies at local favourites. Verified in-store. Pays for itself in 2–3 uses.
               </p>

               <div className="flex flex-col items-center gap-4 md:gap-5">
                  {launchData?.isLaunchPricing && launchData.passesRemaining > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-yellow-300/15 border border-yellow-300/30 px-4 py-1 text-xs md:text-sm text-yellow-200 drop-shadow-md">
                      Early supporter pricing is live
                    </span>
                  )}

                  <Button 
                    variant="primary" 
                    size="lg"
                    className="px-12 transform transition-transform duration-300 hover:scale-105 animate-subtle-pulse disabled:animate-none disabled:bg-gray-500" 
                    onClick={onButtonClick}
                    disabled={isLoading}
                  >
                    {mainButtonText}
                  </Button>

                  <p className="text-white/85 text-xs md:text-sm drop-shadow-md">
                    {trustedText} • Secure checkout
                  </p>

                  <span className="inline-flex items-center gap-2 rounded-full bg-urgency-high/15 border border-urgency-high/30 px-4 py-1 text-xs text-white/90">
                    ❤️ 25% to the Soup Kitchen
                  </span>

                  <a
                    href="#top-picks"
                    className="text-white/90 text-sm font-semibold hover:text-white underline underline-offset-4"
                  >
                    See included deals
                  </a>
                  
                  {/* Subtle scroll down arrow */}
                  <div className="hidden md:block mt-10 opacity-60" style={{ animation: 'gentle-bob 2.5s ease-in-out infinite' }}>
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

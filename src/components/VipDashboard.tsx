import React from 'react';
import Button from './Button.tsx';

interface VipDashboardProps {
  passHolderName: string;
  onViewPass: () => void;
  onSeeAllDeals?: () => void;
}

const VipDashboard: React.FC<VipDashboardProps> = ({ passHolderName, onViewPass, onSeeAllDeals }) => {

  const scrollToDeals = () => {
    if (onSeeAllDeals) {
      onSeeAllDeals();
    } else {
      const dealsSection = document.getElementById('deals-showcase');
      if (dealsSection) {
        dealsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="bg-bg-primary pt-12 md:pt-16 pb-12 md:pb-20">
      <div className="container mx-auto px-4 sm:px-6">
         <div className="max-w-2xl mx-auto scroll-reveal">
            <div className="bg-bg-primary p-6 sm:p-8 rounded-xl border-4 border-action-primary shadow-lg flex flex-col items-center text-center">
             <h2 className="text-2xl font-display font-black text-accent-primary mb-8">Your Digital Pass</h2>
             <button 
               onClick={onViewPass} 
               className="w-48 h-auto aspect-[9/16] bg-action-primary rounded-2xl p-4 flex flex-col justify-between items-center text-white border-2 border-value-highlight shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-value-highlight mb-8"
               aria-label="View your digital pass"
             >
                 <div className="font-display font-black text-sm text-value-highlight">PAHP</div>
                 <div className="text-center">
                   <p className="text-urgency-high text-xs font-semibold">PASS HOLDER</p>
                   <p className="font-display text-lg font-bold text-white break-words">{passHolderName}</p>
                 </div>
                 <div className="w-3 h-3 rounded-full bg-urgency-high animate-live-pulse" />
             </button>
             <div className="flex flex-col sm:flex-row gap-4 w-full">
               <Button onClick={onViewPass} variant="primary" className="flex-1">View My Pass</Button>
               <Button onClick={scrollToDeals} variant="secondary" className="flex-1">See All Deals</Button>
             </div>
             </div>
             </div>
             </div>
             </section>
             );
             };

             export default VipDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VipDashboard from '../components/VipDashboard';
import { PassInfo } from '../context/AuthContext';
import { getAllDeals } from '../services/firestoreService';
import { Deal } from '../types';

interface MyPassPageProps {
  pass: PassInfo;
  redeemedDeals: string[];
  onViewPass: () => void;
}

const MyPassPage: React.FC<MyPassPageProps> = ({ pass, redeemedDeals, onViewPass }) => {
  const navigate = useNavigate();
  const [allDeals, setAllDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const deals = await getAllDeals();
        setAllDeals(deals);
      } catch (error) {
        console.error('Error loading deals:', error);
      }
    };
    loadDeals();
  }, []);

  const handleViewPass = () => {
    onViewPass();
  };

  const handleSeeAllDeals = () => {
    navigate('/deals');
  };

  // Find redeemed deals with their details
  const redeemedDealsDetails = redeemedDeals
    .map(dealName => allDeals.find(deal => deal.name === dealName))
    .filter(deal => deal !== undefined);

  return (
    <main className="pb-24 sm:pb-0">
      <VipDashboard 
        passHolderName={pass.passHolderName}
        onViewPass={handleViewPass}
        onSeeAllDeals={handleSeeAllDeals}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 bg-bg-primary">
         <h2 className="text-2xl sm:text-3xl font-display font-black text-action-primary mb-6">
           Redemption History
         </h2>
         {redeemedDealsDetails.length === 0 ? (
           <div className="bg-bg-card rounded-lg border border-border-subtle p-6 text-center">
             <p className="text-text-secondary">
               Your redemptions will appear here as you use deals from your pass.
             </p>
           </div>
         ) : (
           <div className="space-y-4">
             {redeemedDealsDetails.map((deal) => (
               <div key={deal.name} className="bg-bg-card rounded-lg border border-border-subtle p-6">
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex-1">
                     <h3 className="font-display font-bold text-accent-primary text-lg mb-2">{deal.name}</h3>
                     <p className="text-text-secondary font-medium mb-2">{deal.offer}</p>
                     {deal.terms && (
                       <p className="text-xs text-text-secondary italic">Terms: {deal.terms}</p>
                     )}
                   </div>
                   <div className="flex-shrink-0">
                     <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-success text-white font-bold">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                       <span>Redeemed</span>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
       </section>
        </main>
        );
        };

export default MyPassPage;

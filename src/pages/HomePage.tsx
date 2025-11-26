import React from 'react';
import WelcomeSection from '../components/WelcomeSection';
import PricingOptions from '../components/PricingOptions';
import SavingsProgressBar from '../components/SavingsProgressBar';
import { PassType } from '../types';

interface HomePageProps {
  hasPass: boolean;
  userName?: string;
  onSelectPass?: (passType: PassType) => void;
  passType?: PassType;
  redeemedDeals?: string[];
  purchasePrice?: number; // Actual price paid in Rands
}

const HomePage: React.FC<HomePageProps> = ({ hasPass, userName, onSelectPass, passType, redeemedDeals = [], purchasePrice }) => {

  return (
    <main className="pb-24 sm:pb-0">
      {/* Modest Welcome Section */}
      <section className="py-8 sm:py-12 bg-bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-text-primary mb-2">
            {hasPass ? 'Welcome Back' : 'Welcome'}
          </h1>
          {userName && (
            <p className="text-3xl sm:text-4xl font-black text-action-primary mb-6">
              {userName}
            </p>
          )}
          
          {/* Savings Progress Bar - Show only for users with active pass */}
           {hasPass && passType && (
             <div className="bg-gradient-to-br from-bg-primary via-bg-primary to-bg-secondary p-6 sm:p-8 rounded-xl border border-value-highlight/40 max-w-md mx-auto">
               <SavingsProgressBar passType={passType} redeemedDeals={redeemedDeals} purchasePrice={purchasePrice} />
             </div>
           )}
        </div>
      </section>

      {/* Welcome Section - Show for all signed-in users */}
      <WelcomeSection variant={hasPass ? 'welcomeWithPass' : 'welcome'} />

      {/* Pricing Section - Only for users without a pass */}
      {!hasPass && onSelectPass && (
        <PricingOptions onSelectPass={onSelectPass} />
      )}
      </main>
  );
};

export default HomePage;

import React from 'react';
import { PassInfo } from '../context/AuthContext';
import { useAllDeals } from '../hooks/useAllDeals';
import { useTotalSavings } from '../hooks/useTotalSavings';
import Button from '../components/Button';
import CompactDealCard from '../components/CompactDealCard';

interface VipDashboardProps {
  userName?: string;
  redeemedDeals?: string[];
  pass?: PassInfo | null;
  onBrowseDeals?: () => void;
  onRedeemClick?: (dealName: string) => void;
  onViewPass?: () => void;
}

// Helper to get pass info safely
const getPassInfo = (pass?: PassInfo | null) => ({
  expiryDate: pass?.expiryDate,
});

const VipDashboard: React.FC<VipDashboardProps> = ({
  userName,
  redeemedDeals = [],
  pass,
  onBrowseDeals,
  onRedeemClick,
  onViewPass,
}) => {
  // Fetch real data
  const { deals: allDeals, isLoading: dealsLoading } = useAllDeals();
  const { totalSavings, isLoading: savingsLoading } = useTotalSavings(redeemedDeals);
  const passInfo = getPassInfo(pass);
  
  // Get featured deals
  const featuredDeals = allDeals.filter(deal => deal.featured);
  const todaysFeatured = featuredDeals.length > 0 
    ? featuredDeals[Math.floor(Math.random() * featuredDeals.length)]
    : null;

  const isRedeemed = todaysFeatured?.name && redeemedDeals.includes(todaysFeatured.name);

  return (
    <main className="pb-24 sm:pb-0">
      {/* Welcome Header */}
      <section className="bg-bg-primary pt-8 md:pt-16 pb-4 md:pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center scroll-reveal">
            <h1 className="text-3xl md:text-4xl font-display font-black text-action-primary mb-3">
              Welcome back, {userName || 'Member'}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-6">
              Your pass is active and ready to use
            </p>
            
            {/* Status Badge - Success */}
            <div className="inline-block px-4 py-2 bg-success/20 rounded-full border-2 border-success">
              <span className="text-success font-bold text-sm">Active Member</span>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Cards - Real Data */}
      <section className="bg-bg-primary py-6 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 scroll-reveal">
              {/* Deals Redeemed Card */}
              <div className="bg-action-primary/10 rounded-xl p-4 md:p-6 border-4 border-action-primary shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🎯</span>
                  <span className="text-4xl font-display font-black text-action-primary">
                    {redeemedDeals.length}
                  </span>
                </div>
                <p className="text-text-secondary font-semibold">Deals Redeemed</p>
                {redeemedDeals.length > 0 && (
                  <p className="text-xs text-text-secondary mt-2">
                    {redeemedDeals.length === 1 ? 'Great start!' : 'You\'re saving big!'}
                  </p>
                )}
              </div>

              {/* Total Savings Card */}
              <div className="bg-value-highlight/10 rounded-xl p-4 md:p-6 border-4 border-value-highlight shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">💰</span>
                  <span className="text-4xl font-display font-black text-value-highlight">
                    R{savingsLoading ? '...' : totalSavings}
                  </span>
                </div>
                <p className="text-text-secondary font-semibold">Estimated Savings</p>
                <p className="text-xs text-text-secondary mt-1">
                  Based on average deal value
                </p>
                {totalSavings > 0 && (
                  <p className="text-xs text-text-secondary mt-2">
                    That's {Math.round((totalSavings / (pass?.purchasePrice || 3500)) * 100)}% of pass value back!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Pass Section */}
      <section id="home-pass-section" className="bg-bg-primary py-4 md:py-12" style={{ scrollMarginTop: '80px' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="scroll-reveal">
              <button
                onClick={onViewPass}
                className="w-full bg-action-primary rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left group cursor-pointer"
                style={{
                  color: '#FFFFFF'
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl sm:text-3xl font-display font-black leading-tight group-hover:opacity-95 transition-opacity" style={{ color: '#FFFFFF' }}>Your Digital Pass</h2>
                  <span className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">📱</span>
                </div>
                <p className="text-base sm:text-lg font-semibold mb-4" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                  Quick access to view your pass and redemption history
                </p>
                <div className="inline-flex items-center gap-2 font-bold group-hover:gap-3 transition-all duration-300" style={{ color: '#FFFFFF' }}>
                  <span>View My Pass</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deal - Hidden on mobile, visible on desktop */}
      {todaysFeatured && !dealsLoading && (
        <section className="hidden md:block bg-bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 text-center">
                 Featured Offer
                </h2>
              <p className="text-3xl md:text-4xl font-display font-black text-action-primary mb-8 text-center">
                Don't Miss Out
              </p>

              {/* Featured Deal Card - Centered and appropriately sized */}
              <div className="scroll-reveal flex justify-center">
                <div className="w-full max-w-sm">
                  <CompactDealCard
                    deal={todaysFeatured}
                    index={0}
                    isRedeemed={isRedeemed || false}
                    hasPass={true}
                    passExpiryDate={passInfo.expiryDate}
                    onClick={() => onRedeemClick?.(todaysFeatured.name)}
                    isInGrid={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {(dealsLoading || savingsLoading) && (
        <section className="hidden md:block bg-bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-bg-card rounded-2xl p-8 border-4 border-border-subtle animate-pulse">
                <div className="h-8 bg-border-subtle rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-border-subtle rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Browse All Deals CTA */}
      <section className="bg-bg-primary py-8 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-display font-black text-action-primary mb-6">
              Ready to explore more?
            </h2>
            <Button
              onClick={onBrowseDeals}
              variant="primary"
              className="px-8 py-4"
            >
              Browse All {allDeals.length} Deals
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default VipDashboard;

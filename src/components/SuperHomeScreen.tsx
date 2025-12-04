import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PassInfo } from '../context/AuthContext';
import { Deal } from '../types';
import Pass from './Pass';
import HorizontalCategoryRow from './HorizontalCategoryRow';
import { useTotalSavings } from '../hooks/useTotalSavings';

interface SuperHomeScreenProps {
  // User Info
  userName?: string;
  userPhotoURL?: string;
  pass?: PassInfo | null;

  // Deal Data
  dealsByCategory?: { category: string; emoji: string; deals: Deal[] }[];
  redeemedDeals?: string[];
  passExpiryDate?: string;

  // Interactions
  onRedeemClick?: (dealName: string) => void;
}

/**
 * SuperHomeScreen - Modern "Super Home" for paid pass holders
 * Merges MyPass + Home functionality into one elegant screen
 *
 * Layout:
 * 1. Compact Header (Welcome + Profile Icon)
 * 2. Hero: Large Digital Pass Card (credit card style)
 *    - Clicking opens pass modal
 * 3. Stats: Compact row (Deals Redeemed + Total Savings)
 * 4. Feed: Netflix-style horizontal category rows
 *
 * Strategy: New component, safe to develop alongside existing pages
 */
const SuperHomeScreen: React.FC<SuperHomeScreenProps> = ({
  userName = 'User',
  userPhotoURL,
  pass,
  dealsByCategory = [],
  redeemedDeals = [],
  onRedeemClick,
  passExpiryDate,
}) => {
  const navigate = useNavigate();
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  if (!pass) {
    return null; // Only show this for pass holders
  }

  // Calculate stats
  const redeemCount = redeemedDeals.length;
  const { totalSavings, isLoading: savingsLoading } = useTotalSavings(redeemedDeals);

  return (
    <main className="bg-bg-primary min-h-screen pb-24 md:pb-12">
      {/* ==================== HEADER ==================== */}
      <header className="bg-bg-primary border-b border-border-subtle sticky top-0 z-10">
        <div className="container-px container mx-auto py-4 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Welcome Message */}
            <div>
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide">
                Welcome Back
              </p>
              <h1 className="text-2xl font-display font-black text-text-primary">
                {userName}
              </h1>
            </div>

            {/* Profile Icon - Mobile Only */}
            <button
              onClick={() => navigate('/profile')}
              className="relative w-12 h-12 md:hidden hover:shadow-xl transition-shadow"
              aria-label="Go to profile"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-action-primary to-action-primary/60 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              {userPhotoURL && (
                <img
                  src={userPhotoURL}
                  alt={userName}
                  className="absolute inset-0 w-12 h-12 rounded-full object-cover border-2 border-action-primary shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ==================== HERO: PASS CARD ==================== */}
      <section className="py-8 md:py-12">
        <div className="container-px container mx-auto px-4">
          <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
            {/* Pass Card - Premium Wallet Style */}
            <div className="w-full scroll-reveal">
              <button
                onClick={() => setIsPassModalOpen(true)}
                className="w-full h-52 rounded-2xl p-5 flex flex-col justify-between text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-value-highlight/50 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #0077B6 0%, #00A8E8 50%, #0077B6 100%)',
                }}
                aria-label="View your digital pass"
              >
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }} />
                
                {/* Top row: empty left, chip right */}
                <div className="flex justify-between items-start relative z-10">
                  <div />
                  {/* Gold chip icon */}
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-sm flex items-center justify-center">
                    <div className="w-6 h-4 border border-yellow-700/30 rounded-sm" />
                  </div>
                </div>

                {/* Bottom section: pass info left, tap right */}
                <div className="flex justify-between items-end relative z-10">
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70 mb-1">Holiday Pass</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-live-pulse" />
                      <p className="text-sm text-white/90">
                        Valid until{' '}
                        {new Date(pass.expiryDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-value-highlight text-xs font-semibold uppercase tracking-wide">Tap →</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATS: COMPACT ROW ==================== */}
      <section className="py-6 md:py-8 border-b border-border-subtle">
        <div className="container-px container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {/* Deals Redeemed */}
              <div className="bg-bg-card rounded-lg p-4 md:p-6 border border-border-subtle text-center">
                <p className="text-xs md:text-sm text-text-secondary font-semibold uppercase tracking-wide mb-2">
                  Deals Redeemed
                </p>
                <p className="text-3xl md:text-4xl font-display font-black text-action-primary">
                  {redeemCount}
                </p>
              </div>

              {/* Total Savings */}
              <div className="bg-bg-card rounded-lg p-4 md:p-6 border border-border-subtle text-center">
                <p className="text-xs md:text-sm text-text-secondary font-semibold uppercase tracking-wide mb-2">
                  Total Savings
                </p>
                <p className="text-3xl md:text-4xl font-display font-black text-success">
                  R{savingsLoading ? '...' : totalSavings}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEED: HORIZONTAL CATEGORY ROWS ==================== */}
      <section>
        {dealsByCategory.map((category) => (
          <HorizontalCategoryRow
            key={category.category}
            title={category.category}
            emoji={category.emoji}
            deals={category.deals}
            redeemedDeals={redeemedDeals}
            onRedeemClick={onRedeemClick}
            description={undefined}
            hasPass={!!pass}
            passExpiryDate={passExpiryDate || pass?.expiryDate}
          />
        ))}
      </section>

      {/* Pass Modal */}
      {isPassModalOpen && pass && (
        <Pass
          name={pass.passHolderName}
          passId={pass.passId}
          expiryDate={pass.expiryDate}
          isNew={false}
          passType={pass.passType}
          onClose={() => setIsPassModalOpen(false)}
        />
      )}
    </main>
  );
};

export default SuperHomeScreen;

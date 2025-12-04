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
            {/* Pass Card - Tappable for Verification */}
            <div className="w-full scroll-reveal">
              <button
                onClick={() => setIsPassModalOpen(true)}
                className="w-full h-52 bg-action-primary rounded-2xl p-4 flex flex-col justify-between items-center text-white border-2 border-value-highlight shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-value-highlight"
                aria-label="View your digital pass"
              >
                <div />
                <p className="text-value-highlight text-sm font-semibold">TAP TO VIEW PASS</p>
                <div className="w-3 h-3 rounded-full bg-urgency-high animate-live-pulse" />
              </button>

              {/* Verification Hint */}
              <p className="text-center text-sm text-text-secondary mt-4 font-semibold">
                ✓ Valid until{' '}
                {new Date(pass.expiryDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
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

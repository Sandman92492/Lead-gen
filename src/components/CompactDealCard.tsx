import React, { useState } from 'react';
import { Deal } from '../types';
import { useVendor } from '../hooks/useVendor';
import ImageCarousel from './ImageCarousel';
import DealDetailModal from './DealDetailModal';

interface CompactDealCardProps {
  deal: Deal;
  index: number;
  isRedeemed: boolean;
  onClick?: () => void; // Trigger redemption
  isInGrid?: boolean; // Responsive sizing for grid layout
  hasPass?: boolean; // User has an active pass
  passExpiryDate?: string; // Pass expiry date to check if expired
  onBuyPassClick?: () => void; // Trigger buy pass flow for non-pass holders
}

/**
 * CompactDealCard - Modern, thumbnail-style deal card
 * Used in HorizontalCategoryRow for Netflix-like browsing
 * - Size: ~140x160px image
 * - Image on top
 * - Text (Name + Offer) in white box below
 * - NO action buttons (removed for cleanliness)
 * - Tapping navigates to DealDetailModal
 */
const CompactDealCard: React.FC<CompactDealCardProps> = ({
  deal,
  isRedeemed,
  onClick,
  isInGrid = false,
  hasPass = false,
  passExpiryDate,
  onBuyPassClick,
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { vendor } = useVendor(deal.vendorId);

  const mainImage = deal.imageUrl || vendor?.imageUrl;
  const additionalImages =
    deal.images && deal.images.length > 0 ? deal.images : vendor?.images || [];

  const displayImages = mainImage
    ? [mainImage, ...additionalImages.filter((img) => img !== mainImage)]
    : additionalImages;

  const handleCardClick = () => {
    // Open detail modal when card is clicked
    // Do NOT call onClick here - it will be called from the Redeem button inside the detail modal
    setIsDetailModalOpen(true);
  };

  return (
    <>
      {/* Card Container - Use div instead of button to avoid nesting buttons inside ImageCarousel */}
      <div
        onClick={handleCardClick}
        className={`${isInGrid ? 'w-full max-w-48' : 'flex-shrink-0 w-60'} cursor-pointer group rounded-lg focus-within:ring-2 focus-within:ring-action-primary`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCardClick();
          }
        }}
        aria-label={`View details for ${deal.name}`}
      >
        {/* Image Container (1:1 aspect ratio) */}
        <div className={`relative ${isInGrid ? 'w-full aspect-square' : 'w-60 h-60'} rounded-lg overflow-hidden bg-gray-300 dark:bg-gray-600 shadow-md group-hover:shadow-lg transition-shadow`}>
          {displayImages && displayImages.length > 0 ? (
            <ImageCarousel
              images={displayImages}
              alt={deal.name}
              className="w-full h-full"
              dotsClass="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-75"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
          )}

          {/* Redemption Badge */}
          {isRedeemed && (
            <div className="absolute top-2 right-2 bg-success text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-md">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Used</span>
            </div>
          )}
        </div>

        {/* Text Content - White Box Below Image (Uniform Height) */}
         <div className="mt-2 bg-bg-card rounded-lg p-3 border border-border-subtle shadow-sm group-hover:border-action-primary/30 transition-colors min-h-32 flex flex-col">
           {/* Deal Name */}
           <h3 className="text-sm font-bold text-text-primary line-clamp-2 mb-1">
             {deal.name}
           </h3>

           {/* Offer */}
           <p className="text-xs text-text-secondary font-semibold line-clamp-2 flex-grow">
             {deal.offer}
           </p>

           {/* Savings Badge */}
           {deal.savings && deal.savings > 0 && (
             <span className="inline-block bg-success/10 text-success px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap mt-2">
               Save R{deal.savings}
             </span>
           )}
         </div>
      </div>

      {/* Detail Modal - Opens on card click */}
      <DealDetailModal
        isOpen={isDetailModalOpen}
        deal={deal}
        onClose={() => setIsDetailModalOpen(false)}
        hasPass={hasPass}
        isRedeemed={isRedeemed}
        passExpiryDate={passExpiryDate}
        onRedeemClick={(_dealName) => {
          // Close detail modal first
          setIsDetailModalOpen(false);
          // Then trigger redemption after a delay
          setTimeout(() => {
            onClick?.();
          }, 250);
        }}
        onBuyPassClick={() => {
          setIsDetailModalOpen(false);
          setTimeout(() => {
            onBuyPassClick?.();
          }, 250);
        }}
      />
    </>
  );
};

export default CompactDealCard;

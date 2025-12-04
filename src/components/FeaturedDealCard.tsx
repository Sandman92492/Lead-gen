import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useVendor } from '../hooks/useVendor';
import { Deal } from '../types';
import ImageCarousel from './ImageCarousel';
import ImageGalleryModal from './ImageGalleryModal';
import DealDetailModal from './DealDetailModal';

interface FeaturedDealCardProps {
  deal: Deal;
  index: number;
  hasPass: boolean;
  isRedeemed: boolean;
  passExpiryDate?: string; // Pass expiry date to check if expired
  onRedeemClick?: (dealName: string) => void;
  cardHeight?: 'h-72' | 'h-80' | 'h-96';
}

const FeaturedDealCard: React.FC<FeaturedDealCardProps> = ({
  deal,
  index,
  hasPass,
  isRedeemed,
  passExpiryDate,
  onRedeemClick,
  cardHeight = 'h-96',
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { vendor } = useVendor(deal.vendorId);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open gallery if clicking on buttons, links, or any interactive element
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]') ||
      target.closest('[data-interactive]')
    ) {
      return;
    }
    setIsGalleryOpen(true);
  };

  const handleRedeemClick = (dealName: string) => {
    // Directly trigger redemption - detail modal closes via DealDetailModal's onClose
    onRedeemClick?.(dealName);
  };

  const mainImage = deal.imageUrl || vendor?.imageUrl;
  const additionalImages =
    deal.images && deal.images.length > 0 ? deal.images : vendor?.images || [];

  const displayImages = mainImage
    ? [mainImage, ...additionalImages.filter((img) => img !== mainImage)]
    : additionalImages;

  return (
    <>
      <div
        key={deal.name}
        className="scroll-reveal"
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        {/* Card Container */}
        <div className="rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl">
        {/* Card Container with Image + Overlay */}
        <div
          className={`relative ${cardHeight} group bg-gray-300 dark:bg-gray-600 cursor-pointer`}
          onClick={handleCardClick}
        >
          {/* Image Carousel */}
          <ImageCarousel
            images={displayImages}
            alt={deal.name}
            className="w-full h-full"
            dotsClass="absolute top-4 left-1/2 -translate-x-1/2"
          />

          {/* Gradient Overlay - Always visible, stronger on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>

          {/* Content Overlay - Bottom */}
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-10">
            {/* Venue Name */}
            <h3 className="text-xl sm:text-2xl font-display font-black text-white mb-2 leading-tight">
              {deal.name}
            </h3>

            {/* Offer - Primary Headline */}
              <p className="text-lg sm:text-xl font-bold text-white mb-2">
                {deal.offer}
              </p>

              {/* City Location */}
              {vendor?.city && (
                <p className="text-xs text-gray-200 font-medium mb-4">
                  {vendor.city}
                </p>
              )}

            {/* Learn More Button */}
             {deal.description && (
               <button
                 onClick={() => setIsDetailModalOpen(true)}
                 className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white bg-action-primary/80 rounded-md hover:brightness-110 transition-all"
               >
                 Learn More
               </button>
             )}
          </div>
        </div>
        </div>


      </div>

      {/* Image Gallery Modal - Rendered at root level via portal */}
      {displayImages &&
        displayImages.length > 0 &&
        createPortal(
          <ImageGalleryModal
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            images={displayImages}
            dealName={deal.name}
            location={vendor?.city}
          />,
          document.body
          )}

          {/* Deal Detail Modal */}
          <DealDetailModal
            isOpen={isDetailModalOpen}
            deal={deal}
            onClose={() => setIsDetailModalOpen(false)}
            hasPass={hasPass}
            isRedeemed={isRedeemed}
            passExpiryDate={passExpiryDate}
            onRedeemClick={handleRedeemClick}
          />
          </>
          );
          };
          
          export default FeaturedDealCard;

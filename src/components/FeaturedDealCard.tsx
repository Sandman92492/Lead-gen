import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useVendor } from '../hooks/useVendor';
import { Deal } from '../types';
import ImageCarousel from './ImageCarousel';
import ContactDropdown from './ContactDropdown';
import ImageGalleryModal from './ImageGalleryModal';
import DealDetailModal from './DealDetailModal';
import { isPassExpired as checkPassExpiry } from '../utils/passExpiry';

interface FeaturedDealCardProps {
  deal: Deal;
  index: number;
  hasPass: boolean;
  isRedeemed: boolean;
  passExpiryDate?: string; // Pass expiry date to check if expired
  onRedeemClick?: (dealName: string) => void;
  cardHeight?: 'h-80' | 'h-96';
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
  const mapsUrl = vendor?.mapsUrl || null;
  const isExpired = passExpiryDate ? checkPassExpiry(passExpiryDate) : false;

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
                <p className="text-xs text-gray-200 font-medium mb-2">
                  {vendor.city}
                </p>
              )}

              {/* Terms if present */}
              {deal.terms && (
              <p className="text-xs text-gray-200 font-medium italic mb-4 border-t border-gray-300/50 pt-2">
                <span className="text-xs font-bold uppercase tracking-wide">
                  Terms:
                </span>{' '}
                {deal.terms}
              </p>
            )}

            {/* Action Buttons - Always visible, full width on mobile */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="grid grid-cols-2 gap-2">
                {hasPass && (
                  <>
                    {isExpired ? (
                      <div className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-md bg-gray-500 text-white text-sm sm:text-base font-bold whitespace-nowrap cursor-not-allowed opacity-75">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M13.477 14.89A6 6 0 15 1 2.05 8c.065-.327.67-.985.236-1.378.88-.88 1.95-1.965 2.6-1.965h.5a.5.5 0 0 1 .5.5v5.5a1 1 0 1 1-2 0V8.26l-.464 1.393a1 1 0 1 1-1.933-.644l2-6a1 1 0 0 1 1.933.644l-.464 1.393h1.93l-2.868 8.607a1 1 0 0 1-1.866-.373l2.868-8.607h.5a.5.5 0 0 0 .5-.5V.05z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Pass Expired</span>
                      </div>
                    ) : isRedeemed ? (
                      <div className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-md bg-success text-white text-sm sm:text-base font-bold whitespace-nowrap">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Redeemed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onRedeemClick?.(deal.name)}
                        className="col-span-2 w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white bg-urgency-high rounded-md hover:brightness-110 transition-all"
                      >
                        Redeem
                      </button>
                    )}
                  </>
                )}

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Get directions to ${deal.name}`}
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white bg-action-primary rounded-md hover:brightness-105 transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.5a1 1 0 012 0v4.071a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    <span>Directions</span>
                  </a>
                )}

                <ContactDropdown
                  email={vendor?.email}
                  phone={vendor?.phone}
                  className={!mapsUrl ? 'col-span-2' : ''}
                />
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Learn More Link - Below card */}
        {deal.description && (
          <div className="text-center mt-2">
            <button
              onClick={() => setIsDetailModalOpen(true)}
              className="text-sm font-semibold text-action-primary hover:text-action-primary/80 transition-colors underline"
            >
              Learn more →
            </button>
          </div>
        )}
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
          />
          </>
          );
          };
          
          export default FeaturedDealCard;

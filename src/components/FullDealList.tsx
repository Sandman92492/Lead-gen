import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAllDeals } from '../hooks/useAllDeals';
import { useVendor } from '../hooks/useVendor';
import { Deal } from '../types';
import DealsCategoryFilter from './DealsCategoryFilter';
import FeaturedDealCard from './FeaturedDealCard';
import ContactDropdown from './ContactDropdown';
import ImageGalleryModal from './ImageGalleryModal';
import { isPassExpired as checkPassExpiry } from '../utils/passExpiry';

interface FullDealListProps {
  hasPass: boolean;
  redeemedDeals?: string[];
  passExpiryDate?: string; // Pass expiry date to check if expired
  onRedeemClick?: (dealName: string) => void;
  isFreeUser?: boolean;
  onAuthClick?: () => void;
  onBuyPassClick?: () => void;
}

interface DealListItemProps {
  name: string;
  offer: string;
  mapsUrl?: string;
  hasPass: boolean;
  isRedeemed?: boolean;
  onRedeemClick?: (dealName: string) => void;
  category?: string;
  showCategory?: boolean;
  terms?: string;
  vendorId: string;
  location?: string;
  images?: string[];
  email?: string;
  phone?: string;
  passExpiryDate?: string;
}

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'restaurant':
      return {
        bg: 'bg-urgency-high/10',
        border: 'border-urgency-high',
        text: 'text-urgency-high',
      };
    case 'activity':
      return {
        bg: 'bg-action-primary/10',
        border: 'border-action-primary',
        text: 'text-action-primary',
      };
    case 'shopping':
      return {
        bg: 'bg-value-highlight/10',
        border: 'border-value-highlight',
        text: 'text-value-highlight',
      };
    default:
      return {
        bg: 'bg-bg-card',
        border: 'border-border-subtle',
        text: 'text-text-secondary',
      };
  }
};

const DealListItem: React.FC<DealListItemProps> = ({
  name,
  offer,
  mapsUrl,
  hasPass,
  isRedeemed = false,
  onRedeemClick,
  category,
  showCategory = false,
  terms,
  location,
  images,
  email,
  phone,
  passExpiryDate,
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const savingsMatch = offer.match(/Save R(\d+)/);
  const savingsAmount = savingsMatch ? savingsMatch[0] : null;
  const description = offer
    .replace(/\(Save R\d+[^)]*\)|\(Free \w+[^)]*\)/g, '')
    .trim();

  const isExpired = passExpiryDate ? checkPassExpiry(passExpiryDate) : false;
  const categoryColors = getCategoryColor(category);

  return (
    <>
      <div
        className={`relative rounded-lg border-l-4 border-r-2 border-t-2 border-b-2 transition-all overflow-hidden ${
          isRedeemed
            ? 'bg-bg-primary/50 opacity-70 border-border-subtle'
            : `${categoryColors.border} bg-bg-card hover:shadow-lg hover:brightness-105`
        }`}
      >
        {/* Small clickable image indicator - top right */}
        {images && images.length > 0 && (
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="absolute top-3 right-3 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-bg-card shadow-md hover:shadow-lg hover:scale-105 transition-all z-20 bg-gray-300"
            aria-label={`View ${images.length} images`}
          >
            <img
              src={images[0]}
              alt={`${name} gallery`}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-bold">
                +{images.length - 1}
              </div>
            )}
          </button>
        )}

        <div className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <p className="font-display font-black text-accent-primary text-lg md:text-xl leading-tight">
                {name}
              </p>
            </div>
            {savingsAmount && (
              <div className="flex-shrink-0">
                <div className="inline-block bg-value-highlight px-2.5 py-1 rounded-lg whitespace-nowrap">
                  <p className="text-gray-900 font-black text-lg md:text-xl">
                    {savingsAmount}
                  </p>
                </div>
              </div>
            )}
          </div>

          {location && (
            <p className="text-xs text-text-secondary font-medium mb-2">
              {location}
            </p>
          )}

          <p className="text-sm md:text-base text-text-secondary font-medium mb-2 flex-grow">
            {description}
          </p>

          {terms && (
            <p className="text-xs text-text-secondary font-medium italic mb-3 border-t-2 border-border-subtle pt-2 bg-bg-primary/30 rounded">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                Terms:
              </span>{' '}
              {terms}
            </p>
          )}

          {showCategory && category && (
            <span
              className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border mb-3 w-fit ${categoryColors.bg} ${categoryColors.border} border ${categoryColors.text}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          )}

          <div className="flex flex-col gap-3 mt-auto">
            <div className="grid grid-cols-2 gap-2">
              {hasPass && (
                <>
                  {isExpired ? (
                    <div className="col-span-2 inline-flex items-center justify-center gap-1.5 px-6 py-3 md:py-2.5 rounded-md bg-gray-500 text-white text-base font-bold whitespace-nowrap cursor-not-allowed opacity-75">
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
                    <button
                      disabled
                      className="col-span-2 inline-flex items-center justify-center gap-1.5 px-6 py-3 md:py-2.5 rounded-md bg-success text-white text-base font-bold whitespace-nowrap"
                    >
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
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRedeemClick?.(name)}
                      className="col-span-2 inline-flex items-center justify-center gap-1.5 px-6 py-3 md:py-2.5 rounded-md text-base font-bold text-white bg-urgency-high hover:brightness-110 transition-all whitespace-nowrap"
                    >
                      <span>Redeem</span>
                    </button>
                  )}
                </>
              )}

              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Get directions to ${name}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 text-base font-bold text-white bg-action-primary rounded-md hover:brightness-110 transition-all whitespace-nowrap shadow-lg"
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
                email={email}
                phone={phone}
                className={!mapsUrl ? 'col-span-2' : ''}
                buttonClassName="px-6 py-3 md:py-2.5 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal - Rendered at root level via portal */}
      {images &&
        images.length > 0 &&
        createPortal(
          <ImageGalleryModal
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            images={images}
            dealName={name}
            location={location}
          />,
          document.body
        )}
    </>
  );
};

interface DealListItemWithVendorProps {
  deal: Deal;
  hasPass: boolean;
  isRedeemed: boolean;
  onRedeemClick?: (dealName: string) => void;
  passExpiryDate?: string;
}

const DealListItemWithVendor: React.FC<DealListItemWithVendorProps> = ({
  deal,
  hasPass,
  isRedeemed,
  onRedeemClick,
  passExpiryDate,
}) => {
  const { vendor } = useVendor(deal.vendorId);

  const mainImage = deal.imageUrl || vendor?.imageUrl;
  const additionalImages =
    deal.images && deal.images.length > 0
      ? deal.images
      : vendor?.images || [];

  const displayImages = mainImage
    ? [mainImage, ...additionalImages.filter((img) => img !== mainImage)]
    : additionalImages;

  return (
    <DealListItem
      name={deal.name}
      offer={deal.offer}
      mapsUrl={vendor?.mapsUrl}
      terms={deal.terms}
      hasPass={hasPass}
      isRedeemed={isRedeemed}
      onRedeemClick={onRedeemClick}
      category={deal.category}
      location={vendor?.city}
      vendorId={deal.vendorId}
      images={displayImages}
      email={vendor?.email}
      phone={vendor?.phone}
      passExpiryDate={passExpiryDate}
    />
  );
};

const FullDealList: React.FC<FullDealListProps> = ({
  hasPass,
  redeemedDeals = [],
  passExpiryDate,
  onRedeemClick,
  isFreeUser = false,
  onBuyPassClick,
}) => {
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const { deals: allDeals, isLoading } = useAllDeals();
  const isPassExpired = passExpiryDate ? checkPassExpiry(passExpiryDate) : false;

  const featuredDeals = isFreeUser
    ? []
    : allDeals.filter((deal) => deal.featured);
  const regularDeals = allDeals.filter((deal) => !deal.featured);

  const totalDeals = allDeals.length;
  const categories = Array.from(
    new Set(allDeals.map((d) => d.category).filter(Boolean))
  ) as string[];

  const filteredFeatured = filterCategory
    ? featuredDeals.filter((d) => d.category === filterCategory)
    : featuredDeals;
  const filteredRegular = filterCategory
    ? regularDeals.filter((d) => d.category === filterCategory)
    : regularDeals;

  return (
    <section id="full-deal-list" className="bg-bg-primary relative">
      {isPassExpired && hasPass && (
        <div className="bg-red-50 dark:bg-red-950/30 border-t border-b border-red-200 dark:border-red-800 py-4">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200">Your pass has expired</p>
                <p className="text-sm text-red-800 dark:text-red-300">Purchase a new pass to access exclusive deals</p>
              </div>
              <button
                onClick={onBuyPassClick}
                className="flex-shrink-0 px-6 py-2 bg-urgency-high text-white font-bold rounded-md hover:brightness-110 transition-all whitespace-nowrap"
              >
                Get New Pass
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <DealsCategoryFilter
          subtitle={isFreeUser ? 'Browse All Partners' : undefined}
          title="Deals By Category"
          description={`Explore all ${totalDeals}+ partner venues organized by what you love`}
          categories={categories}
          selectedCategory={filterCategory}
          onCategoryChange={setFilterCategory}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
        {isLoading && (
          <p className="text-center text-text-secondary">Loading deals...</p>
        )}

        {!isLoading && allDeals.length === 0 && (
          <p className="text-center text-text-secondary">
            No deals available yet.
          </p>
        )}

        {/* Featured Deals Section */}
        {!isLoading && filteredFeatured.filter((deal) => !redeemedDeals.includes(deal.name)).length > 0 && (
          <div className="mb-12 pb-8 border-b border-border-subtle">
            <h3 className="text-2xl font-bold text-accent-primary mb-6 text-center">
              Featured Deals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredFeatured
                .filter((deal) => !redeemedDeals.includes(deal.name))
                .map((deal, index) => (
                  <FeaturedDealCard
                    key={deal.name}
                    deal={deal}
                    index={index}
                    hasPass={hasPass}
                    isRedeemed={redeemedDeals.includes(deal.name)}
                    passExpiryDate={passExpiryDate}
                    onRedeemClick={onRedeemClick}
                    cardHeight="h-80"
                  />
                ))}
            </div>
          </div>
        )}

        {/* Regular Deals Section */}
         {!isLoading && filteredRegular.length > 0 && (
           <div>
             <h3 className="text-2xl font-bold text-accent-primary mb-6 text-center">
               {filteredFeatured.length > 0 ? 'All Other Deals' : 'All Deals'}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
               {filteredRegular
                 .filter((deal) => !redeemedDeals.includes(deal.name))
                 .map((deal) => (
                   <DealListItemWithVendor
                     key={deal.name}
                     deal={deal}
                     hasPass={hasPass}
                     isRedeemed={redeemedDeals.includes(deal.name)}
                     onRedeemClick={onRedeemClick}
                     passExpiryDate={passExpiryDate}
                   />
                 ))}
             </div>
           </div>
         )}

        {!isLoading &&
          filteredFeatured.length === 0 &&
          filteredRegular.length === 0 &&
          allDeals.length > 0 && (
            <p className="text-center text-text-secondary">
              No deals in this category.
            </p>
          )}
      </div>
    </section>
  );
};

export default FullDealList;

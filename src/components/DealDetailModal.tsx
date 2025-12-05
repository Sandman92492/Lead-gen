import React from 'react';
import BaseModal from './BaseModal';
import { Deal } from '../types';
import { useVendor } from '../hooks/useVendor';
import ContactDropdown from './ContactDropdown';
import { isPassExpired as checkPassExpiry } from '../utils/passExpiry';

interface DealDetailModalProps {
  isOpen: boolean;
  deal: Deal | null;
  onClose: () => void;
  hasPass?: boolean;
  isRedeemed?: boolean;
  passExpiryDate?: string;
  onRedeemClick?: (dealName: string) => void;
  onBuyPassClick?: () => void;
}

const DealDetailModal: React.FC<DealDetailModalProps> = ({
  isOpen,
  deal,
  onClose,
  hasPass = false,
  isRedeemed = false,
  passExpiryDate,
  onRedeemClick,
  onBuyPassClick,
}) => {
  const { vendor } = useVendor(deal?.vendorId || '');
  const mapsUrl = vendor?.mapsUrl || null;
  const isExpired = passExpiryDate ? checkPassExpiry(passExpiryDate) : false;

  if (!deal) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton>
      <div className="flex flex-col max-h-[calc(100vh-120px)]">
        {/* Scrollable Content */}
        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Deal Name */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-action-primary mb-1">
              {deal.name}
            </h2>
            {vendor && (
              <p className="text-xs sm:text-sm text-text-secondary font-medium">
                {vendor.name}
                {deal.city && ` • ${deal.city}`}
              </p>
            )}
          </div>

          {/* Offer - Bold Primary Headline */}
          <div className="bg-action-primary/10 rounded-lg p-3 sm:p-4 border border-action-primary/30">
            <p className="text-lg sm:text-xl font-bold text-action-primary">
              {deal.offer}
            </p>
          </div>

          {/* Description - Marketing Copy */}
          {deal.description && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">
                Details
              </h3>
              <p className="text-sm sm:text-base text-text-primary leading-relaxed whitespace-pre-wrap">
                {deal.description}
              </p>
            </div>
          )}

          {/* Terms */}
          {deal.terms && (
            <div className="bg-bg-primary rounded-lg p-3 sm:p-4 border border-border-subtle">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                Terms & Conditions
              </p>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {deal.terms}
              </p>
            </div>
          )}

          {/* Category + City Badges */}
          <div className="flex flex-wrap gap-3">
            {/* Category Badge */}
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 ${
              deal.category === 'restaurant' ? 'bg-urgency-high/10 text-urgency-high border-urgency-high/30' :
              deal.category === 'activity' ? 'bg-action-primary/10 text-action-primary border-action-primary/30' :
              deal.category === 'shopping' ? 'bg-value-highlight/10 text-value-highlight border-value-highlight/30' :
              'bg-bg-primary text-text-secondary border-border-subtle'
            }`}>
              {deal.category === 'restaurant' && '🍔'}
              {deal.category === 'activity' && '🛶'}
              {deal.category === 'shopping' && '🛍️'}
              <span className="capitalize">{deal.category || 'Deal'}</span>
            </span>
            
            {/* City Badge */}
            {deal.city && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-bg-primary text-text-secondary border-2 border-border-subtle">
                📍 {deal.city}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="flex flex-col gap-2 mt-6 pt-6 border-t border-border-subtle">
          <div className="grid grid-cols-2 gap-2">
            {/* Redeem Button - Show for pass holders */}
            {hasPass ? (
              <>
                {isExpired ? (
                  <div className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-gray-500 text-white text-sm font-bold whitespace-nowrap cursor-not-allowed opacity-75">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 15 1 2.05 8c.065-.327.67-.985.236-1.378.88-.88 1.95-1.965 2.6-1.965h.5a.5.5 0 0 1 .5.5v5.5a1 1 0 1 1-2 0V8.26l-.464 1.393a1 1 0 1 1-1.933-.644l2-6a1 1 0 0 1 1.933.644l-.464 1.393h1.93l-2.868 8.607a1 1 0 0 1-1.866-.373l2.868-8.607h.5a.5.5 0 0 0 .5-.5V.05z" clipRule="evenodd" />
                    </svg>
                    <span>Pass Expired</span>
                  </div>
                ) : isRedeemed ? (
                  <div className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-success text-white text-sm font-bold whitespace-nowrap">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Redeemed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      // Close this modal first, then trigger redemption
                      onClose();
                      // Use delay to ensure modal closes before redemption modal opens
                      setTimeout(() => {
                        onRedeemClick?.(deal.name);
                      }, 250);
                    }}
                    className="col-span-2 w-full px-4 py-3 text-sm font-bold text-white bg-urgency-high rounded-md hover:brightness-110 transition-all"
                  >
                    Redeem
                  </button>
                )}
              </>
            ) : (
              /* Get Pass Button - Show for non-pass holders */
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    onBuyPassClick?.();
                  }, 250);
                }}
                className="col-span-2 w-full px-4 py-3 text-sm font-bold text-white bg-action-primary rounded-md hover:brightness-110 transition-all"
              >
                🎟️ Get Pass to Redeem
              </button>
            )}

            {/* Directions Button */}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Get directions to ${deal.name}`}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-white bg-action-primary rounded-md hover:brightness-105 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.5a1 1 0 012 0v4.071a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span>Directions</span>
              </a>
            )}

            {/* Contact Button */}
            <ContactDropdown
              email={vendor?.email}
              phone={vendor?.phone}
              className={!mapsUrl ? 'col-span-2' : ''}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default DealDetailModal;

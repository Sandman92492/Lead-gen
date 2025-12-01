import React from 'react';
import BaseModal from './BaseModal';
import { Deal } from '../types';
import { useVendor } from '../hooks/useVendor';

interface DealDetailModalProps {
  isOpen: boolean;
  deal: Deal | null;
  onClose: () => void;
}

const DealDetailModal: React.FC<DealDetailModalProps> = ({
  isOpen,
  deal,
  onClose,
}) => {
  const { vendor } = useVendor(deal?.vendorId || '');

  if (!deal) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton>
      <div className="space-y-6">
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

        {/* City */}
        {deal.city && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-bg-primary text-text-secondary px-3 py-1.5 rounded-full border border-border-subtle font-medium">
              📍 {deal.city}
            </span>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default DealDetailModal;

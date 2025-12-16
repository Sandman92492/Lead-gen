import React, { useState } from 'react';
import Button from './Button.tsx';
import BaseModal from './BaseModal.tsx';

interface RedemptionConfirmationModalProps {
  isOpen: boolean;
  dealName: string;
  dealOffer: string;
  vendorId: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const RedemptionConfirmationModal: React.FC<RedemptionConfirmationModalProps> = ({
  isOpen,
  dealName,
  dealOffer,
  vendorId: _vendorId,
  onConfirm,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      // Error handled in parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel} title="Enter Raffle?" showCloseButton zIndex={60}>
      <div className="text-center">
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-action-primary/20 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-action-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <p className="text-text-secondary mb-6">
          Are you sure you want to enter:
        </p>

        <div className="bg-bg-primary border border-accent-primary/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-text-secondary mb-2">{dealName}</p>
          <p className="font-display font-bold text-lg text-accent-primary">{dealOffer}</p>
        </div>

        <p className="text-sm text-text-secondary mb-6">
          Once entered, you won't be able to enter this raffle again. Make sure you're ready to submit your entry.
        </p>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="redeem"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Entering...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default RedemptionConfirmationModal;

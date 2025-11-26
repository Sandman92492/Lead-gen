import React, { useState } from 'react';
import { verifyVendorPin, getVendorById } from '../services/firestoreService';
import { Vendor } from '../types';
import Button from './Button.tsx';
import BaseModal from './BaseModal';
import { validatePin } from '../utils/validation';

interface PinVerificationModalProps {
  isOpen: boolean;
  vendorId: string;
  dealName: string;
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  isOpen,
  vendorId,
  dealName,
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [vendorLoading, setVendorLoading] = useState(true);

  // Load vendor data on mount
  React.useEffect(() => {
    const loadVendor = async () => {
      const vendorData = await getVendorById(vendorId);
      setVendor(vendorData);
      setVendorLoading(false);
    };
    loadVendor();
  }, [vendorId]);

  const handleVerifyPin = async () => {
    setError('');

    // Validate PIN
    const pinError = validatePin(pin);
    if (pinError) {
      setError(pinError.message);
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await verifyVendorPin(vendorId, pin);

      if (isValid) {
        setPin('');
        await onSuccess();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
      } catch {
      setError('An error occurred. Please try again.');
      } finally {
      setIsLoading(false);
      }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    setError('');
  };

  if (vendorLoading && isOpen) {
    return (
      <BaseModal isOpen={isOpen} onClose={onCancel}>
        <p className="text-text-secondary text-center">Loading vendor information...</p>
      </BaseModal>
    );
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel} title="Vendor Verification" showCloseButton>
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-display font-black text-accent-primary mb-2">
            Vendor Verification
          </h2>

          <p className="text-text-secondary mb-4">
            Please ask the staff to enter their 4-digit PIN to verify this redemption.
          </p>

          {vendor && (
            <div className="bg-bg-primary border border-accent-primary/30 rounded-lg p-3 mb-6">
              <p className="text-sm text-text-secondary mb-1">Venue:</p>
              <p className="font-display font-bold text-accent-primary">{vendor.name}</p>
            </div>
          )}

          <div className="bg-bg-primary border border-accent-primary/30 rounded-lg p-3 mb-6">
            <p className="text-sm text-text-secondary mb-1">Deal:</p>
            <p className="font-display font-bold text-accent-primary">{dealName}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              4-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={handlePinChange}
              placeholder="••••"
              maxLength={4}
              className="w-full px-4 py-3 text-center text-2xl font-mono bg-bg-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-action-primary focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-urgency-high/10 border border-urgency-high rounded-lg p-3 mb-6">
              <p className="text-sm font-medium text-urgency-high">{error}</p>
            </div>
          )}

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
              onClick={handleVerifyPin}
              disabled={isLoading || pin.length !== 4}
              className="flex-1"
            >
              {isLoading ? 'Verifying...' : 'Verify PIN'}
            </Button>
          </div>
          </div>
          </BaseModal>
  );
};

export default PinVerificationModal;

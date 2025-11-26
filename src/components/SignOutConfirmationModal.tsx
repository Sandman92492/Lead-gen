import React from 'react';
import Button from './Button';
import BaseModal from './BaseModal';

interface SignOutConfirmationModalProps {
  isOpen: boolean;
  userEmail?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const SignOutConfirmationModal: React.FC<SignOutConfirmationModalProps> = ({ isOpen, userEmail, onConfirm, onCancel }) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onCancel} title="Sign Out" showCloseButton>
      <div className="text-center">
        <p className="text-text-secondary text-sm mb-6">
          {userEmail && <>Signing out from <span className="font-semibold text-text-primary">{userEmail}</span></>}
        </p>

        <p className="text-text-secondary text-center mb-8">
          Are you sure you want to sign out? You'll need to sign in again to access your pass.
        </p>

        <div className="space-y-3">
          <Button
            type="button"
            variant="redeem"
            className="w-full !text-white"
            onClick={onConfirm}
          >
            Yes, Sign Out
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default SignOutConfirmationModal;

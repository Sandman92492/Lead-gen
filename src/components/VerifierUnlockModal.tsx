import React from 'react';
import BaseModal from './BaseModal';
import Button from './Button';
import { copy } from '../copy';

type VerifierUnlockModalProps = {
  isOpen: boolean;
  pin: string;
  onPinChange: (next: string) => void;
  onUnlock: () => void;
  isUnlocking?: boolean;
  error?: string | null;
  onClose: () => void;
};

const VerifierUnlockModal: React.FC<VerifierUnlockModalProps> = ({
  isOpen,
  pin,
  onPinChange,
  onUnlock,
  isUnlocking = false,
  error = null,
  onClose,
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={copy.verifier.pinTitle} maxWidth="sm">
      <p className="text-text-secondary text-sm">{copy.verifier.subtitle}</p>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">{copy.verifier.pinHint}</div>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => onPinChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="••••"
          className="w-full rounded-xl bg-bg-primary border border-border-subtle px-4 py-3 text-center text-2xl font-mono text-text-primary placeholder:text-text-secondary/60 transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          disabled={isUnlocking}
        />
        {error && (
          <div className="bg-urgency-high/10 border border-urgency-high rounded-lg p-3 mt-4">
            <p className="text-sm font-semibold text-urgency-high">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button
          variant="primary"
          className="w-full"
          onClick={onUnlock}
          disabled={isUnlocking || pin.length !== 4}
        >
          {isUnlocking ? copy.verifier.unlocking : copy.verifier.unlock}
        </Button>
      </div>
    </BaseModal>
  );
};

export default VerifierUnlockModal;

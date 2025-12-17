import React, { useMemo } from 'react';
import Button from './Button';
import { copy } from '../copy';

type VerifierResultCardProps = {
  result: 'allowed' | 'denied';
  reason: string;
  onNext: () => void;
};

const toReasonLabel = (reason: string): string => {
  const normalized = String(reason || '').toLowerCase();
  if (normalized.includes('expired')) return 'Expired';
  if (normalized.includes('permit') || normalized.includes('allowed_type') || normalized.includes('not_permitted')) {
    return 'Not permitted';
  }
  if (normalized.includes('invalid') || normalized.includes('code')) return 'Invalid code';
  return reason || '—';
};

const VerifierResultCard: React.FC<VerifierResultCardProps> = ({ result, reason, onNext }) => {
  const tone = result === 'allowed' ? 'success' : 'urgency';
  const label = result === 'allowed' ? 'Allowed' : 'Denied';
  const icon = result === 'allowed' ? '✅' : '❌';
  const reasonLabel = useMemo(() => toReasonLabel(reason), [reason]);

  return (
    <div
      className={`rounded-2xl p-5 border ${
        tone === 'success' ? 'bg-success/10 border-success' : 'bg-urgency-high/10 border-urgency-high'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-3xl font-display font-black ${
              tone === 'success' ? 'text-success' : 'text-urgency-high'
            }`}
          >
            {label} <span className="text-xl">{icon}</span>
          </p>
          <p className="text-sm text-text-secondary mt-1">Reason: {reasonLabel}</p>
        </div>
      </div>

      <div className="mt-4">
        <Button variant="outline" className="w-full" onClick={onNext}>
          {copy.verifier.verifyNext}
        </Button>
      </div>
    </div>
  );
};

export default VerifierResultCard;


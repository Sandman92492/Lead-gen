import React, { useState } from 'react';
import Button from './Button';
import BaseModal from './BaseModal';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

interface ConsentModalProps {
  userEmail: string;
  onAccept: () => void;
  onDecline: () => void;
  isOpen: boolean;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ userEmail, onAccept, onDecline, isOpen }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToPopia, setAgreedToPopia] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const allAgreed = agreedToTerms && agreedToPrivacy && agreedToPopia;

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onDecline}
        title="Welcome!"
        maxWidth="md"
        showCloseButton={false}
      >
        <div className="text-center mb-8">
          <p className="text-text-secondary text-sm">
            {userEmail}
          </p>
          <p className="text-text-secondary text-sm mt-3">
            Please agree to continue
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Legal Requirements</p>
          
          <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-accent-primary/20 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition cursor-pointer group">
            <div className="flex-shrink-0 flex items-center h-5 pt-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded accent-accent-primary cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                className="text-sm font-semibold text-accent-primary hover:text-action-primary underline transition text-left"
              >
                Terms of Service
              </button>
              <span className="text-xs text-text-secondary">
                I agree to the usage terms and conditions
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-accent-primary/20 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition cursor-pointer group">
            <div className="flex-shrink-0 flex items-center h-5 pt-1">
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="w-5 h-5 rounded accent-accent-primary cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacyModal(true);
                }}
                className="text-sm font-semibold text-accent-primary hover:text-action-primary underline transition text-left"
              >
                Privacy Policy
              </button>
              <span className="text-xs text-text-secondary">
                I agree to how my data is collected and used
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-accent-primary/20 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition cursor-pointer group">
            <div className="flex-shrink-0 flex items-center h-5 pt-1">
              <input
                type="checkbox"
                checked={agreedToPopia}
                onChange={(e) => setAgreedToPopia(e.target.checked)}
                className="w-5 h-5 rounded accent-accent-primary cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacyModal(true);
                }}
                className="text-sm font-semibold text-accent-primary hover:text-action-primary underline transition text-left"
              >
                POPIA Compliance
              </button>
              <span className="text-xs text-text-secondary">
                I consent to data processing (South African privacy law)
              </span>
            </div>
          </label>
        </div>

        <div className="space-y-2">
          {!allAgreed && (
            <p className="text-xs text-action-primary bg-action-primary/10 border border-action-primary/30 p-3 rounded-lg text-center">
              You must agree to all terms to continue
            </p>
          )}
          <Button
            variant="primary"
            className={`w-full transition-opacity ${!allAgreed ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!allAgreed}
            onClick={onAccept}
          >
            Continue
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={onDecline}
          >
            Decline & Sign Out
          </Button>
        </div>
      </BaseModal>

      {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
      {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
    </>
  );
};

export default ConsentModal;

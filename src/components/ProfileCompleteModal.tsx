import React, { useState } from 'react';
import Button from './Button';
import BaseModal from './BaseModal';
import FormInput from './FormInput';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import PopiaCompliance from './PopiaCompliance';
import { updateUserProfile } from '../services/authService';
import { validateRequired, validateConsent } from '../utils/validation';

interface ProfileCompleteModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onProfileComplete: (name: string) => void;
}

const ProfileCompleteModal: React.FC<ProfileCompleteModalProps> = ({
  isOpen,
  userEmail,
  onClose,
  onProfileComplete,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToPopia, setAgreedToPopia] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPopiaModal, setShowPopiaModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate name
    const nameError = validateRequired(name, 'Full name');
    if (nameError) {
      setError(nameError.message);
      return;
    }

    // Validate consent
    const consentError = validateConsent(agreedToTerms, agreedToPrivacy, agreedToPopia);
    if (consentError) {
      setError(consentError.message);
      return;
    }

    setIsLoading(true);
    const result = await updateUserProfile(name.trim());
    setIsLoading(false);

    if (result.success) {
      onProfileComplete(name.trim());
      setName('');
      setAgreedToTerms(false);
      setAgreedToPrivacy(false);
      setAgreedToPopia(false);
    } else {
      setError(result.error || 'Failed to save profile');
    }
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Complete Your Profile"
        maxWidth="md"
        showCloseButton={false}
      >
        <p className="text-text-secondary text-sm mb-6">
          Just a few details to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-text-secondary mb-2 text-left">Email</p>
            <p className="w-full px-4 py-3 bg-bg-primary border-2 border-border-subtle rounded-lg text-text-primary">
              {userEmail}
            </p>
          </div>

          <FormInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Full Name"
            ariaLabel="Your Full Name"
            disabled={isLoading}
            required
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Legal Requirements
            </p>

            <label className="flex items-start gap-3 p-3 rounded-lg border-2 border-accent-primary/20 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition cursor-pointer group">
              <div className="flex-shrink-0 flex items-center h-5 pt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 rounded accent-accent-primary cursor-pointer"
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPopiaModal(true);
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

          {error && (
            <p className="text-action-primary text-sm bg-action-primary/20 border border-action-primary/50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {!agreedToTerms || !agreedToPrivacy || !agreedToPopia ? (
            <p className="text-xs text-action-primary bg-action-primary/10 border border-action-primary/30 p-3 rounded-lg text-center">
              You must agree to all terms and conditions to continue
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            className={`w-full text-lg transition-opacity ${
              !agreedToTerms || !agreedToPrivacy || !agreedToPopia
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={
              isLoading || !agreedToTerms || !agreedToPrivacy || !agreedToPopia
            }
          >
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </form>
      </BaseModal>

      {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
      {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
      {showPopiaModal && <PopiaCompliance onClose={() => setShowPopiaModal(false)} />}
    </>
  );
};

export default ProfileCompleteModal;

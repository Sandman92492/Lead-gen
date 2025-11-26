import React, { useState } from 'react';
import Button from './Button.tsx';
import BaseModal from './BaseModal.tsx';
import FormInput from './FormInput.tsx';
import { PassType } from '../types.ts';

interface SignUpModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onSignUpComplete: (name: string, passType: PassType) => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, userEmail, onClose, onSignUpComplete }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !name.trim()) return;

    setIsLoading(true);
    onSignUpComplete(name.trim(), 'holiday');
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Welcome!" maxWidth="md">
      <p className="text-text-secondary mb-6">We need your name to create your digital pass.</p>
      
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

        <div>
          <p className="text-sm text-text-secondary mb-3 text-left">Pass Details</p>
          <div className="w-full px-4 py-3 bg-bg-secondary rounded-lg border-2 border-border-subtle text-text-primary">
            <div className="font-semibold">Holiday Pass</div>
            <div className="text-sm text-text-secondary">R199 • Dec 1 - Jan 31</div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full text-lg"
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </Button>

        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="w-full px-4 py-2 text-text-secondary hover:text-text-primary transition"
        >
          Skip for now
        </button>
      </form>
    </BaseModal>
  );
};

export default SignUpModal;

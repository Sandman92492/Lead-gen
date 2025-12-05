import React, { useState, useEffect } from 'react';
import Button from './Button.tsx';
import BaseModal from './BaseModal.tsx';
import FormInput from './FormInput.tsx';
import { PassType } from '../types.ts';
import { useToast } from '../context/ToastContext';
import { haptics } from '../utils/haptics';
import { validateName, validateEmail } from '../utils/validation';
import { getPassPrice } from '../utils/pricing';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  passType: PassType;
  userEmail?: string;
  userDisplayName?: string;
  userId?: string;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, userEmail, userDisplayName, userId }) => {
  const { showToast } = useToast();
  const [name, setName] = useState(userDisplayName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [passPrice, setPassPrice] = useState({ price: 199, cents: 19900, launchPricing: false });

  // Load dynamic price and sync email/name when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadPrice = async () => {
        const price = await getPassPrice();
        setPassPrice(price);
      };
      loadPrice();
      
      // Sync email and name when modal opens (important if user signs in after modal is mounted)
      setEmail(userEmail || '');
      setName(userDisplayName || '');
    }
  }, [isOpen, userEmail, userDisplayName]);

  const handleYocoPayment = async () => {
    try {
      setIsLoading(true);
      
      // Call Netlify function to create checkout
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: passPrice.cents,
          passType: 'holiday',
          userEmail: email.trim(),
          passHolderName: name.trim(),
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
         haptics.error();
         showToast("Error creating payment: " + (data.error || 'Unknown error'), 'error');
         setIsLoading(false);
         return;
       }

       // Redirect to Yoco checkout
       if (data.redirectUrl) {
         window.location.href = data.redirectUrl;
       } else {
         haptics.error();
         showToast("Error: No payment URL received", 'error');
         setIsLoading(false);
       }
      } catch (error) {
       haptics.error();
       showToast("An error occurred. Please try again.", 'error');
       setIsLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    const nameError = validateName(name);
    if (nameError) {
      showToast(nameError.message, 'error');
      return;
    }

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      showToast(emailError.message, 'error');
      return;
    }
    
    await handleYocoPayment();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Get Your Holiday Pass"
      maxWidth="sm"
    >
      {/* Price Badge */}
      <div className="flex justify-center mb-4">
        <div className="bg-action-primary/10 border border-action-primary/30 rounded-full px-4 py-2">
          <span className="text-2xl font-bold text-action-primary">R{passPrice.price}</span>
          {passPrice.launchPricing && (
            <span className="ml-2 text-sm text-text-secondary line-through">R199</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Email Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Name on pass</label>
            <FormInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              ariaLabel="Your Full Name"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Email for receipt</label>
            <FormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              ariaLabel="Your Email Address"
              disabled={isLoading || !!userEmail}
              required
            />
          </div>
        </div>

        {/* CTA Button */}
        <Button type="submit" variant="payment" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? 'Redirecting to payment...' : 'Proceed to Payment'}
        </Button>

        {/* Trust Signals */}
        <div className="bg-bg-primary rounded-lg p-3 text-xs text-text-secondary space-y-2">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Secure payment powered by <strong>Yoco</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>💳</span>
            <span>Card, Apple Pay & Google Pay accepted</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>14-day refund if no deals redeemed</span>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default PurchaseModal;

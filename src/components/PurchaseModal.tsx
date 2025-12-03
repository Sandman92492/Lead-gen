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

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, passType, userEmail, userDisplayName, userId }) => {
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
      title={`Get Your ${passType.charAt(0).toUpperCase() + passType.slice(1)} Pass!`}
      maxWidth="md"
    >
      <p className="text-text-secondary mb-4 sm:mb-6 text-xs sm:text-base">Enter your details to personalize and purchase your pass.</p>
           
      {/* Trust Signals */}
      <div className="mb-4 sm:mb-6 space-y-1 text-xs text-text-secondary">
        <p>• Secure payment with Yoco</p>
        <p>• SSL encrypted and secure</p>
        <p>• 14-day cooling-off period (no deals redeemed)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 text-left">
        {/* Section 1: Your Details */}
        <div>
          <h3 className="text-xs font-bold text-action-primary mb-2 sm:mb-3">1. YOUR DETAILS</h3>
          <p className="text-xs text-text-secondary mb-2 sm:mb-3">This name will be displayed on your pass</p>
          <div className="space-y-2 sm:space-y-3">
            <FormInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              ariaLabel="Your Full Name"
              disabled={isLoading}
              required
            />
            <FormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
              ariaLabel="Your Email Address"
              disabled={isLoading || !!userEmail}
              required
            />
          </div>
        </div>

        {/* Section 2: Payment Method */}
        <div>
          <h3 className="text-xs font-bold text-action-primary mb-3 sm:mb-4">2. PROCEED TO PAYMENT</h3>

          <div className="text-xs text-text-secondary mb-4 sm:mb-6">
            You will be redirected to Yoco's secure payment page to complete your purchase. We accept card, Apple Pay, and Google Pay.
          </div>
          
          <Button type="submit" variant="payment" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? 'Redirecting to Payment...' : <>Proceed to Payment (R{passPrice.price})</>}
          </Button>
        </div>
      </form>

      {/* Footer Trust Info */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border-subtle text-xs text-text-secondary space-y-1">
        <p>Your payment is processed by Yoco, South Africa's leading payment processor.</p>
        <p>We never store your card details. Your data is encrypted and secure.</p>
      </div>
    </BaseModal>
  );
};

export default PurchaseModal;

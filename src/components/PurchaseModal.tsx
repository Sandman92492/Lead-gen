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
  userId?: string;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, passType, userEmail, userId }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [passPrice, setPassPrice] = useState({ price: 199, cents: 19900, launchPricing: false });

  // Load dynamic price when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadPrice = async () => {
        const price = await getPassPrice();
        setPassPrice(price);
      };
      loadPrice();
    }
  }, [isOpen]);

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
      <p className="text-text-secondary mb-8">Enter your details to personalize and purchase your pass.</p>
           
      {/* Trust Signals */}
      <div className="mb-8 space-y-2 text-sm text-text-secondary">
        <p>• Secure payment with Yoco</p>
        <p>• SSL encrypted and secure</p>
        <p>• 14-day money-back guarantee</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-left">
        {/* Section 1: Your Details */}
        <div>
          <h3 className="text-sm font-bold text-action-primary mb-4">1. YOUR DETAILS</h3>
          <div className="space-y-4">
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
          <h3 className="text-sm font-bold text-action-primary mb-3">2. SELECT PAYMENT METHOD</h3>
          
          {/* OR PAY BY CARD Separator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border-subtle"></div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Pay by Card</span>
            <div className="flex-1 h-px bg-border-subtle"></div>
          </div>

          <div className="text-sm text-text-secondary mb-6">
            You will be redirected to Yoco's secure payment page.
          </div>
          
          {passPrice.launchPricing && (
            <div className="bg-urgency-high bg-opacity-10 border border-urgency-high rounded-lg p-3 mb-4">
              <p className="text-sm text-urgency-high font-semibold">🎉 Launch Pricing: R{passPrice.price} (Limited time)</p>
            </div>
          )}
          
          <Button type="submit" variant="payment" className="w-full text-lg bg-brand-yellow !text-gray-900 font-bold" disabled={isLoading}>
            {isLoading ? 'Redirecting to Payment...' : <>Pay R<span className="font-bold">{passPrice.price}</span> with Card</>}
          </Button>
        </div>
      </form>

      {/* Footer Trust Info */}
      <div className="mt-8 pt-6 border-t border-border-subtle text-xs text-text-secondary space-y-2">
        <p>Your payment is processed by Yoco, South Africa's leading payment processor.</p>
        <p>We never store your card details. Your data is encrypted and secure.</p>
      </div>
    </BaseModal>
  );
};

export default PurchaseModal;

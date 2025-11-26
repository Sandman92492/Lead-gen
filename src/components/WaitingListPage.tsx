import React, { useState } from 'react';
import Button from './Button';

interface WaitingListPageProps {
  onClose: () => void;
}

const WaitingListPage: React.FC<WaitingListPageProps> = ({ onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const phoneNumber = '27799569040';
  const passName = 'Holiday Pass';
  const whatsappMessage = `Hi, I'd like to join the waiting list for the ${passName}!`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleWhatsAppClick = () => {
    setIsSubmitted(true);
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-card rounded-2xl p-8 max-w-md w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isSubmitted ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-action-primary bg-opacity-10 rounded-full mb-4">
                <svg className="w-8 h-8 text-action-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-black text-text-primary mb-2">Join the Waiting List</h2>
              <p className="text-text-secondary">Be first to know when {passName} becomes available</p>
            </div>

            <div className="bg-bg-primary rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-text-secondary">
                <span className="font-semibold text-text-primary block mb-1">Currently Unavailable</span>
                Pass purchases are temporarily closed. Join our waiting list to get instant access when we reopen.
              </p>
            </div>

            <Button
              variant="primary"
              className="w-full text-lg py-3 mb-4"
              onClick={handleWhatsAppClick}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.867 1.167l-.348.217-3.6-.94.957 3.51-.235.364a9.758 9.758 0 001.496 5.963 9.723 9.723 0 005.396 3.789l.355.063 3.614-.939-.939 3.619.367.359a9.747 9.747 0 005.959-1.471 9.752 9.752 0 003.769-5.37l.063-.355.939-3.614-.355.064a9.871 9.871 0 00-5.404-9.961l-.348-.217 3.61-1.16A11.995 11.995 0 0012 2c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12s5.373-12 12-12z" />
                </svg>
                Join via WhatsApp
              </span>
            </Button>

            <button
              onClick={onClose}
              className="text-action-primary hover:text-action-primary-hover text-sm font-medium"
            >
              Maybe Later
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-block p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-black text-text-primary mb-2">Thanks for Joining!</h2>
            <p className="text-text-secondary mb-6">Check your WhatsApp messages. We'll notify you as soon as passes are available again.</p>

            <Button
              variant="primary"
              className="w-full text-lg py-3"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingListPage;

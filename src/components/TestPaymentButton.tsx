import React from 'react';

const TestPaymentButton: React.FC = () => {
  const handleTestPayment = async () => {
    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 9900,
          passType: 'holiday',
          userEmail: 'test@example.com',
          passHolderName: 'Test User',
          userId: 'test-user-id'
        }),
      });

      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('Error: No redirect URL received');
      }
    } catch (error) {
      console.error('Test payment failed:', error);
      alert('Test payment failed');
    }
  };

  // Only show on staging
  if ((import.meta as any).env.VITE_SHOW_TEST_BUTTON !== 'true') {
    return null;
  }

  return (
    <button
      onClick={handleTestPayment}
      className="fixed bottom-4 right-4 px-4 py-2 bg-yellow-500 text-black rounded font-bold text-sm hover:bg-yellow-600 z-40"
    >
      TEST: Yoco Checkout
    </button>
  );
};

export default TestPaymentButton;

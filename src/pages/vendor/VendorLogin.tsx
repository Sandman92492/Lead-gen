import React, { useState } from 'react';
import Button from '../../components/Button';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { validatePin, validateRequired } from '../../utils/validation';

const VendorLogin: React.FC = () => {
  const { login } = useVendorAuth();
  const [vendorId, setVendorId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const vendorIdError = validateRequired(vendorId, 'Vendor ID');
    if (vendorIdError) {
      setError(vendorIdError.message);
      return;
    }

    const pinError = validatePin(pin);
    if (pinError) {
      setError(pinError.message);
      return;
    }

    setIsSubmitting(true);
    const result = await login(vendorId.trim(), pin);
    if (!result.success) {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    setError('');
  };

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-bg-card rounded-2xl border border-border-subtle shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-black text-action-primary">Vendor Portal</h1>
          <p className="text-text-secondary mt-2">
            Log in with your Vendor ID and 4-digit PIN to view redemptions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Vendor ID</label>
            <input
              type="text"
              value={vendorId}
              onChange={(e) => {
                setVendorId(e.target.value);
                setError('');
              }}
              placeholder="e.g. kakklein-collective"
              className="w-full px-4 py-3 bg-bg-primary border-2 border-accent-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-secondary transition text-text-primary"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">4-Digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={handlePinChange}
              placeholder="••••"
              maxLength={4}
              className="w-full px-4 py-3 text-center text-2xl font-mono bg-bg-primary border-2 border-accent-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-secondary transition text-text-primary"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="bg-urgency-high/10 border border-urgency-high rounded-lg p-3">
              <p className="text-sm font-medium text-urgency-high">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || pin.length !== 4 || !vendorId.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-xs text-text-secondary text-center">
          <p>For support, contact the Holiday Pass team.</p>
        </div>
      </div>
    </main>
  );
};

export default VendorLogin;

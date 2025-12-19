import React, { useState } from 'react';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signOut } from '../services/authService';
import Button from './Button';
import BaseModal from './BaseModal';
import FormInput from './FormInput';
import ConsentModal from './ConsentModal';
import { validateEmail, validatePassword, validatePasswordMatch } from '../utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleConsent, setShowGoogleConsent] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError.message);
      return;
    }

    // Validate password
    const passwordError = validatePassword(password, 6);
    if (passwordError) {
      setError(passwordError.message);
      return;
    }

    if (isSignUp) {
      // Validate password match
      const matchError = validatePasswordMatch(password, confirmPassword);
      if (matchError) {
        setError(matchError.message);
        return;
      }

      setIsLoading(true);
      const result = await signUpWithEmail(email, password);
      setIsLoading(false);
      
      if (result.success) {
        onAuthSuccess();
      } else {
        setError(result.error);
      }
    } else {
      setIsLoading(true);
      const result = await signInWithEmail(email, password);
      setIsLoading(false);
      
      if (result.success) {
        onAuthSuccess();
      } else {
        setError(result.error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    const result = await signInWithGoogle();
    setIsLoading(false);
    
    if (result.success) {
      // If it's a new user, show consent modal
      if (result.isNewUser) {
        setGoogleUserEmail(result.user?.email || null);
        setShowGoogleConsent(true);
      } else {
        // Existing user, proceed with auth
        onAuthSuccess();
      }
    } else {
      // Show user-friendly error message
      setError(result.error || 'An error occurred during sign-in. Please try again.');
    }
  };

  const handleGoogleConsentAccept = () => {
    setShowGoogleConsent(false);
    setGoogleUserEmail(null);
    onAuthSuccess();
  };

  const handleGoogleConsentDecline = async () => {
    // Sign out the user since they declined consent
    await signOut();
    setShowGoogleConsent(false);
    setGoogleUserEmail(null);
    setError('You must agree to our terms to continue');
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={isSignUp ? 'Create Account' : 'Sign In'}
        maxWidth="md"
      >
      <p className="text-text-secondary text-sm mb-6">
        {isSignUp ? 'Create an account to access your credential.' : 'Sign in to view your credential.'}
      </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">


          <FormInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            ariaLabel="Email Address"
          />

          <FormInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            ariaLabel="Password"
          />

          {isSignUp && (
            <FormInput
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              ariaLabel="Confirm Password"
            />
          )}



          {error && (
            <p className="text-action-primary text-sm bg-action-primary/20 border border-action-primary/50 p-3 rounded-[var(--r-md)]">
              {error}
            </p>
          )}



          <Button
            type="submit"
            variant="primary"
            className="w-full text-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-bg-card text-text-secondary">Or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-[var(--r-md)] hover:shadow-md hover:border-action-primary/30 transition flex items-center justify-center gap-3 text-text-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
        </button>

        <p className="text-center text-text-secondary text-sm mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-accent-primary hover:text-action-primary transition font-semibold"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </p>
    </BaseModal>

    {googleUserEmail && (
      <ConsentModal
        isOpen={showGoogleConsent}
        userEmail={googleUserEmail}
        onAccept={handleGoogleConsentAccept}
        onDecline={handleGoogleConsentDecline}
      />
    )}
    </>
  );
};

export default AuthModal;

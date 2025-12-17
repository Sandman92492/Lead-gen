import React, { useEffect, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import AuthModal from './components/AuthModal';
import LoadingScreen from './components/LoadingScreen';
import SignOutConfirmationModal from './components/SignOutConfirmationModal';
import ToastContainer from './components/ToastContainer';
import SignedInTabsApp from './components/SignedInTabsApp';
import CookieConsentBanner from './components/CookieConsentBanner';
import ScrollToTopButton from './components/ScrollToTopButton';
import { UpdateBanner } from './components/UpdateBanner';

import GuestCredentialPage from './pages/GuestCredentialPage';
import PublicLandingPage from './pages/PublicLandingPage';
import VerifierPage from './pages/VerifierPage';

import { useAuth } from './context/AuthContext';
import { signOut } from './services/authService';
import { copy } from './copy';

const App: React.FC = () => {
  const { user, userState, isLoading, userPhotoURL } = useAuth();
  const navigate = useNavigate();

  const guestMatch = useMatch('/guest/:token');
  const verifyMatch = useMatch('/verify') || useMatch('/verifier');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutConfirmationOpen, setIsSignOutConfirmationOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    if (adminParam === 'true') {
      sessionStorage.setItem('adminParamDetected', 'true');
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const adminEmail = (import.meta as any).env.VITE_ADMIN_EMAIL;
    if (!adminEmail) return;

    const adminParamDetected = sessionStorage.getItem('adminParamDetected') === 'true';
    if (adminParamDetected && user.email === adminEmail) {
      sessionStorage.removeItem('adminParamDetected');
      navigate('/admin', { replace: true });
    }
  }, [navigate, user]);

  const handleMainCta = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    navigate('/credential');
  };

  const handleConfirmSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      setIsSignOutConfirmationOpen(false);
    }
  };

  const buttonText = user ? 'Open credential' : copy.landing.signIn;

  if (guestMatch) {
    return <GuestCredentialPage token={guestMatch.params.token || ''} />;
  }

  if (verifyMatch) {
    return <VerifierPage />;
  }

  return (
    <div>
      <UpdateBanner />
      <CookieConsentBanner />
      <ScrollToTopButton />
      <ToastContainer />
      {isLoading && <LoadingScreen />}

      {userState === 'free' && (
        <Header
          onButtonClick={handleMainCta}
          buttonText={buttonText}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onSignOutClick={() => setIsSignOutConfirmationOpen(true)}
          isAuthenticated={!!user && !isLoading}
          userEmail={user?.email}
          userPhotoURL={userPhotoURL}
          isSignedIn={false}
        />
      )}

      {userState === 'free' ? (
        <PublicLandingPage onSignIn={() => setIsAuthModalOpen(true)} />
      ) : (
        <SignedInTabsApp
          userEmail={user?.email}
          userPhotoURL={userPhotoURL}
          onSignOut={() => setIsSignOutConfirmationOpen(true)}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          setIsAuthModalOpen(false);
          navigate('/credential');
        }}
      />

      <SignOutConfirmationModal
        isOpen={isSignOutConfirmationOpen}
        userEmail={user?.email}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setIsSignOutConfirmationOpen(false)}
      />
    </div>
  );
};

export default App;

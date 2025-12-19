import React, { useState } from 'react';
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

import PublicLeadCapturePage from './pages/PublicLeadCapturePage';
import PublicPassPage from './pages/PublicPassPage';
import PublicLandingPage from './pages/PublicLandingPage';

import { useAuth } from './context/AuthContext';
import { signOut } from './services/authService';
import { copy } from './copy';

const App: React.FC = () => {
  const { user, userState, isLoading, userPhotoURL } = useAuth();
  const navigate = useNavigate();

  const captureMatch = useMatch('/c/:campaignSlug');
  const passMatch = useMatch('/p/:leadId');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutConfirmationOpen, setIsSignOutConfirmationOpen] = useState(false);

  const handleMainCta = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    navigate('/leads');
  };

  const handleConfirmSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      setIsSignOutConfirmationOpen(false);
    }
  };

  const buttonText = user ? 'Open dashboard' : copy.landing.signIn;

  if (captureMatch) {
    return <PublicLeadCapturePage campaignSlug={captureMatch.params.campaignSlug || ''} />;
  }

  if (passMatch) {
    return <PublicPassPage leadId={passMatch.params.leadId || ''} />;
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
          navigate('/leads');
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

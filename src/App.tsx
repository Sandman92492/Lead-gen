import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LaunchBanner from './components/LaunchBanner.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import PurchaseModal from './components/PurchaseModal.tsx';
import Pass from './components/Pass.tsx';
import AuthModal from './components/AuthModal.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import TermsOfService from './components/TermsOfService.tsx';
import CharitySection from './components/CharitySection.tsx';
import FAQ from './components/FAQ.tsx';
import PaymentSuccess from './components/PaymentSuccess.tsx';
import PaymentFailure from './components/PaymentFailure.tsx';
import PaymentCancel from './components/PaymentCancel.tsx';
import RedemptionConfirmationModal from './components/RedemptionConfirmationModal.tsx';
import PinVerificationModal from './components/PinVerificationModal.tsx';
import RedemptionSuccessModal from './components/RedemptionSuccessModal.tsx';
import ActivatePassModal from './components/ActivatePassModal.tsx';
import SignOutConfirmationModal from './components/SignOutConfirmationModal.tsx';
import OnboardingModal from './components/OnboardingModal.tsx';
import ProfileCompleteModal from './components/ProfileCompleteModal.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import FreeUserView from './components/FreeUserView.tsx';
import SignedInTabsApp from './components/SignedInTabsApp.tsx';
import ToastContainer from './components/ToastContainer.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import CookieConsentBanner from './components/CookieConsentBanner.tsx';

import { PassType } from './types.ts';
import { signOut } from './services/authService';
import { recordRedemption, getRedemptionsByPass, getAllDeals, getVendorById, getPassesByUserId } from './services/firestoreService';
import { useAuth } from './context/AuthContext';
import { activateSharedPass } from './server/validation';
import { isPassExpired } from './utils/passExpiry';

const App: React.FC = () => {
  const { user, userState, pass, isLoading, userPhotoURL, redeemedDeals, setRedeemedDeals } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPassType, setSelectedPassType] = useState<PassType | null>(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileCompleteOpen, setIsProfileCompleteOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isTermsOfServiceOpen, setIsTermsOfServiceOpen] = useState(false);
  const [isCharitySectionOpen, setIsCharitySectionOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  const [isPassVisible, setIsPassVisible] = useState(false);
  const [isFirstPurchase, setIsFirstPurchase] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Redemption state
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [selectedDealToRedeem, setSelectedDealToRedeem] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isPinVerificationOpen, setIsPinVerificationOpen] = useState(false);
  const [justRedeemedDeal, setJustRedeemedDeal] = useState<string | null>(null);
  const [redemptionVendorName, setRedemptionVendorName] = useState<string | null>(null);

  // Sign out confirmation
  const [isSignOutConfirmationOpen, setIsSignOutConfirmationOpen] = useState(false);

  // Admin dashboard access (check URL param for admin mode)
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Store admin param in sessionStorage on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    if (adminParam === 'true') {
      sessionStorage.setItem('adminParamDetected', 'true');
    }
  }, []);
  
  // Check admin access when user loads
  useEffect(() => {
    if (!user) return;
    
    const ADMIN_EMAIL = (import.meta as any).env.VITE_ADMIN_EMAIL;
    if (!ADMIN_EMAIL) return; // Admin email not configured
    
    const adminParamDetected = sessionStorage.getItem('adminParamDetected') === 'true';
    const emailMatches = user?.email === ADMIN_EMAIL;
    
    if (adminParamDetected && emailMatches) {
      setIsAdminMode(true);
    }
  }, [user]);

  // Payment result modals
  const [paymentResult, setPaymentResult] = useState<'success' | 'failure' | 'cancel' | null>(null);

  // Scroll to top when userState changes to free
  useEffect(() => {
    if (userState === 'free') {
      window.scrollTo(0, 0);
    }
  }, [userState]);

  // Detect payment redirects from Yoco
  useEffect(() => {
    const paymentPath = window.location.pathname;

    if (paymentPath.includes('/payment/success')) {
      setPaymentResult('success');
      // Clear the URL
      window.history.replaceState({}, document.title, '/');
    } else if (paymentPath.includes('/payment/failure')) {
      setPaymentResult('failure');
      window.history.replaceState({}, document.title, '/');
    } else if (paymentPath.includes('/payment/cancel') || paymentPath.includes('/payment/return')) {
      setPaymentResult('cancel');
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Load redeemed deals from Firestore when pass loads
  useEffect(() => {
    const loadRedeemedDeals = async () => {
      if (pass?.passId) {
        try {
          const redemptions = await getRedemptionsByPass(pass.passId);
          const dealNames = redemptions.map(r => r.dealName);
          setRedeemedDeals(dealNames);
        } catch (error) {
          console.error('Failed to load redeemed deals:', error);
        }
      }
    };
    loadRedeemedDeals();
  }, [pass?.passId]);

  // Handle post-auth purchase flow when user auth state updates
  useEffect(() => {
    if (user && selectedPassType && isAuthModalOpen === false) {
      // User just signed in and selected a pass type, proceed with purchase
      handleSelectAndPurchase(selectedPassType);
    }
  }, [user, selectedPassType, isAuthModalOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.1,
    });

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Build tabs array for signed-in users
  const tabs = useMemo(() => {
    const hasPass = userState === 'signed-in-with-pass' && pass !== null;
    return [
      { id: 'home', label: 'Home', path: '/home' },
      { id: 'deals', label: 'All Deals', path: '/deals' },
      ...(hasPass ? [{ id: 'pass', label: 'My Pass', path: '/pass' }] : []),
      { id: 'profile', label: 'Profile', path: '/profile' },
    ];
  }, [userState, pass]);

  const handleActivatePass = async (pId: string, primaryName: string, _pOneName: string | null) => {
    if (!user?.email) {
      return { success: false, message: "You must be signed in to activate a shared pass." };
    }

    const result = await activateSharedPass(pId, primaryName, user.email);
    if (result.success) {
      setIsActivateModalOpen(false);
      setIsPassVisible(true);
      setIsFirstPurchase(false);
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const handleSelectAndPurchase = (passType: PassType) => {
    // If not authenticated, open auth modal first
    if (!user) {
      setSelectedPassType(passType);
      setIsAuthModalOpen(true);
      return;
    }
    // If authenticated and has displayName, open purchase modal
    if (user.displayName) {
      setSelectedPassType(passType);
      setIsPurchaseModalOpen(true);
    } else {
      // Need to complete profile first
      setSelectedPassType(passType);
      setIsProfileCompleteOpen(true);
    }
  };

  const handleProfileComplete = () => {
    setIsProfileCompleteOpen(false);
    // Open purchase modal with selected pass type
    if (selectedPassType) {
      setTimeout(() => {
        setIsPurchaseModalOpen(true);
      }, 300);
    }
  };

  const handleClosePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
    setSelectedPassType(null);
  };

  const handleMainCta = () => {
    if (userState === 'signed-in-with-pass') {
      // User has a pass, show it
      setIsPassVisible(true);
    } else if (userState === 'free') {
      // Unauthenticated user clicks CTA - open auth modal
      setIsAuthModalOpen(true);
    } else if (userState === 'signed-in') {
      // Authenticated user without a pass - go to pricing
      document.getElementById('pricing-options')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClosePass = () => {
    setIsPassVisible(false);
    if (isFirstPurchase) {
      setIsFirstPurchase(false);
    }
  };

  const handlePassClick = () => {
    setIsPassVisible(false);
    setIsFirstPurchase(false);
    setShowOnboarding(true); // Show onboarding after first pass view
  };

  const getButtonText = () => {
    if (isLoading) return 'Checking Pass...';
    if (userState === 'signed-in-with-pass') return 'View My Pass';
    return 'Get My Pass';
  };

  const handleRedeemDeal = async (dealName: string, vendorId?: string, vendorName?: string) => {
    if (!pass?.passId) {
      return;
    }

    // Add deal to redeemed list
    if (!redeemedDeals.includes(dealName)) {
      const updatedDeals = [...redeemedDeals, dealName];
      setRedeemedDeals(updatedDeals);

      // Save to Firestore if user is logged in
      if (user && vendorId) {
        await recordRedemption(pass.passId, dealName, vendorId, user.uid);
      }
    }

    setIsPinVerificationOpen(false);
    setIsRedemptionModalOpen(false);
    setSelectedDealToRedeem(null);
    setSelectedVendorId(null);

    // Show success screen for staff verification
    setJustRedeemedDeal(dealName);
    setRedemptionVendorName(vendorName || null);
  };

  const openRedemptionModal = async (dealName: string) => {
    // Check if pass is expired
    if (pass?.expiryDate && isPassExpired(pass.expiryDate)) {
      // useToast is not available here, so we'll handle this at the component level
      // by passing the pass expiry status to deal cards
      return;
    }

    // Fetch deal from Firestore to get vendorId
    try {
      const allDeals = await getAllDeals();
      const deal = allDeals.find(d => d.name === dealName);

      if (deal && deal.vendorId) {
        setSelectedDealToRedeem(dealName);
        setSelectedVendorId(deal.vendorId);
        setIsRedemptionModalOpen(true);
      }
    } catch (error) {
      // Silently fail - user can try again
    }
  };

  const handleSignOutClick = () => {
    setIsSignOutConfirmationOpen(true);
  };

  const handleConfirmSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      setIsSignOutConfirmationOpen(false);
    }
  };

  // Show admin dashboard if in admin mode
  if (isAdminMode) {
    return (
      <div>
        <ToastContainer />
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div>
      <LaunchBanner />
      <CookieConsentBanner />
      <ToastContainer />
      {isLoading && <LoadingScreen />}

      {selectedPassType && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={handleClosePurchaseModal}
          passType={selectedPassType}
          userEmail={user?.email}
          userDisplayName={user?.displayName}
          userId={user?.uid}
        />
      )}

      <ActivatePassModal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        onActivate={handleActivatePass}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          setIsAuthModalOpen(false);
          // After auth, scroll to home/top
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100);
          // If they selected a pass type, it will be handled by the useEffect that watches user changes
          // Otherwise, just stay on home page and let user browse
        }}
      />

      {user && (
        <ProfileCompleteModal
          isOpen={isProfileCompleteOpen}
          userEmail={user.email}
          onClose={() => {
            setIsProfileCompleteOpen(false);
            setSelectedPassType(null);
          }}
          onProfileComplete={handleProfileComplete}
        />
      )}

      {selectedDealToRedeem && selectedVendorId && (
        <RedemptionConfirmationModal
          isOpen={isRedemptionModalOpen}
          dealName={selectedDealToRedeem}
          vendorId={selectedVendorId}
          onConfirm={async () => {
            // Close confirmation modal and open PIN verification
            setIsRedemptionModalOpen(false);
            setIsPinVerificationOpen(true);
          }}
          onCancel={() => {
            setIsRedemptionModalOpen(false);
            setSelectedDealToRedeem(null);
            setSelectedVendorId(null);
          }}
        />
      )}

      {selectedDealToRedeem && selectedVendorId && (
        <PinVerificationModal
          isOpen={isPinVerificationOpen}
          vendorId={selectedVendorId}
          dealName={selectedDealToRedeem}
          onSuccess={async () => {
            // Get vendor name for success screen
            const vendor = await getVendorById(selectedVendorId);
            await handleRedeemDeal(selectedDealToRedeem, selectedVendorId, vendor?.name);
          }}
          onCancel={() => {
            setIsPinVerificationOpen(false);
            setSelectedDealToRedeem(null);
            setSelectedVendorId(null);
          }}
        />
      )}

      <RedemptionSuccessModal
        isOpen={!!justRedeemedDeal}
        dealName={justRedeemedDeal || ''}
        venueName={redemptionVendorName || 'Partner Venue'}
        onClose={() => {
          setJustRedeemedDeal(null);
          setRedemptionVendorName(null);
        }}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          // Scroll to deals section
          setTimeout(() => {
            const dealsSection = document.getElementById('deals-showcase');
            if (dealsSection) {
              dealsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }}
      />

      {isPassVisible && pass && (
        <Pass
          name={pass.passHolderName}
          passId={pass.passId}
          onClose={handleClosePass}
          onCardClick={isFirstPurchase ? handlePassClick : undefined}
          isNew={isFirstPurchase}
          passType={pass.passType}
          expiryDate={pass.expiryDate}
          userEmail={user?.email}
        />
      )}

      <Header
        onButtonClick={handleMainCta}
        buttonText={getButtonText()}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onSignOutClick={handleSignOutClick}
        onActivateClick={() => setIsActivateModalOpen(true)}
        isAuthenticated={!!user && !isLoading}
        userEmail={user?.email}
        userPhotoURL={userPhotoURL}
        isSignedIn={userState !== 'free'}
        tabs={userState !== 'free' ? tabs : undefined}
        currentPath={location.pathname}
        onTabClick={(path) => navigate(path)}
      />

      {userState === 'free' && (
        <FreeUserView
          onSelectPass={handleSelectAndPurchase}
          onActivateClick={() => setIsActivateModalOpen(true)}
          onMainCtaClick={handleMainCta}
          onAuthClick={() => setIsAuthModalOpen(true)}
        />
      )}

      {(userState === 'signed-in' || userState === 'signed-in-with-pass') && (
        <SignedInTabsApp
          userState={userState}
          pass={pass}
          redeemedDeals={redeemedDeals}
          user={user}
          userEmail={user?.email}
          userPhotoURL={userPhotoURL}
          onMainCta={handleMainCta}
          onRedeemClick={openRedemptionModal}
          onSignOut={handleSignOutClick}
          onSelectPass={handleSelectAndPurchase}
          onBuyPassClick={() => handleSelectAndPurchase('holiday')}
          onPrivacyClick={() => setIsPrivacyPolicyOpen(true)}
          onTermsClick={() => setIsTermsOfServiceOpen(true)}
          onCharityClick={() => setIsCharitySectionOpen(true)}
          onFaqClick={() => setIsFaqOpen(true)}
        />
      )}

      {userState === 'free' && (
        <Footer
          onButtonClick={handleMainCta}
          buttonText={getButtonText()}
          hasPass={false}
          onPrivacyClick={() => setIsPrivacyPolicyOpen(true)}
          onTermsClick={() => setIsTermsOfServiceOpen(true)}
        />
      )}

      {isPrivacyPolicyOpen && <PrivacyPolicy onClose={() => setIsPrivacyPolicyOpen(false)} />}
      {isTermsOfServiceOpen && <TermsOfService onClose={() => setIsTermsOfServiceOpen(false)} />}
      
      {isCharitySectionOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={() => setIsCharitySectionOpen(false)}>
          <div className="min-h-screen flex items-start justify-center pt-8 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-bg-primary rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setIsCharitySectionOpen(false)}
                className="sticky top-0 right-0 p-4 text-text-secondary hover:text-text-primary float-right"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div onClick={(e) => e.stopPropagation()}>
                <CharitySection />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isFaqOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={() => setIsFaqOpen(false)}>
          <div className="min-h-screen flex items-start justify-center pt-8 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-bg-primary rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setIsFaqOpen(false)}
                className="sticky top-0 right-0 p-4 text-text-secondary hover:text-text-primary float-right"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div onClick={(e) => e.stopPropagation()}>
                <FAQ />
              </div>
            </div>
          </div>
        </div>
      )}

      <SignOutConfirmationModal
        isOpen={isSignOutConfirmationOpen}
        userEmail={user?.email}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setIsSignOutConfirmationOpen(false)}
      />

      {paymentResult === 'success' && (
        <PaymentSuccess onClose={() => setPaymentResult(null)} />
      )}

      {paymentResult === 'failure' && (
        <PaymentFailure
          onClose={() => setPaymentResult(null)}
          onRetry={() => {
            setPaymentResult(null);
            if (selectedPassType) {
              setIsPurchaseModalOpen(true);
            }
          }}
        />
      )}

      {paymentResult === 'cancel' && (
        <PaymentCancel onClose={() => setPaymentResult(null)} />
      )}
    </div>
  );
};

export default App;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LeadsPage from '../pages/LeadsPage';
import LeadDetailPage from '../pages/LeadDetailPage';
import CampaignsPage from '../pages/CampaignsPage';
import CampaignDetailPage from '../pages/CampaignDetailPage';
import SettingsPage from '../pages/SettingsPage';
import UiDemoPage from '../pages/UiDemoPage';
import AppShell from './AppShell';
import { copy } from '../copy';
import { DealsIcon, GuestsIcon, ProfileIcon } from './TabIcons';
import { haptics } from '../utils/haptics';
import SetupWizard from './SetupWizard';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { useToast } from '../context/ToastContext';

interface SignedInTabsAppProps {
  userEmail?: string;
  userPhotoURL?: string;
  onSignOut: () => void;
}

const SignedInTabsApp: React.FC<SignedInTabsAppProps> = ({ userEmail, userPhotoURL, onSignOut }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { shouldShowWizard, markWizardSeen, isLoading: onboardingLoading } = useOnboardingProgress();
  const [showWizard, setShowWizard] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    showToast('🚀 System Updated to V2', 'success', 5000);
  }, [showToast]);

  // Show wizard for new users
  useEffect(() => {
    if (!onboardingLoading && shouldShowWizard) {
      setShowWizard(true);
    }
  }, [onboardingLoading, shouldShowWizard]);

  const handleWizardComplete = () => {
    markWizardSeen();
    setShowWizard(false);
    navigate('/leads', { replace: true });
  };

  useEffect(() => {
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      if (location.pathname === '/' || location.pathname === '') {
        navigate('/leads', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }, [location.pathname]);

  const tabs = useMemo(
    () => [
      { id: 'leads', label: copy.nav.leads, path: '/leads', icon: <DealsIcon /> },
      { id: 'campaigns', label: copy.nav.campaigns, path: '/campaigns', icon: <GuestsIcon /> },
      { id: 'settings', label: copy.nav.settings, path: '/settings', icon: <ProfileIcon /> },
    ],
    []
  );

  if (showWizard) {
    return <SetupWizard onComplete={handleWizardComplete} />;
  }

  return (
    <AppShell
      nav={tabs}
      currentPath={location.pathname}
      onNavigate={(path) => {
        haptics.tap();
        navigate(path);
      }}
      userEmail={userEmail}
      userPhotoURL={userPhotoURL}
      onSignOut={onSignOut}
    >
      <div ref={contentRef} className="bg-bg-primary">
        <Routes>
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:leadId" element={<LeadDetailPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:campaignId" element={<CampaignDetailPage />} />
          <Route path="/settings/*" element={<SettingsPage userEmail={userEmail} userPhotoURL={userPhotoURL} onSignOut={onSignOut} />} />
          <Route path="/ui" element={<UiDemoPage />} />

          {/* Backward-compat redirects */}
          <Route path="/qr" element={<Navigate to="/campaigns" replace />} />
          <Route path="/credential" element={<Navigate to="/campaigns" replace />} />
          <Route path="/guests" element={<Navigate to="/campaigns" replace />} />
          <Route path="/offers" element={<Navigate to="/leads" replace />} />
          <Route path="/profile" element={<Navigate to="/settings" replace />} />
          <Route path="*" element={<Navigate to="/leads" replace />} />
        </Routes>
      </div>
    </AppShell>
  );
};

export default SignedInTabsApp;

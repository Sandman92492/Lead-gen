import React, { useEffect, useMemo, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LeadsPage from '../pages/LeadsPage';
import LeadDetailPage from '../pages/LeadDetailPage';
import CampaignsPage from '../pages/CampaignsPage';
import CampaignDetailPage from '../pages/CampaignDetailPage';
import QrPage from '../pages/QrPage';
import SettingsPage from '../pages/SettingsPage';
import UiDemoPage from '../pages/UiDemoPage';
import AppShell from './AppShell';
import { copy } from '../copy';
import { DealsIcon, GuestsIcon, PassIcon, ProfileIcon } from './TabIcons';
import { haptics } from '../utils/haptics';

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
      { id: 'qr', label: copy.nav.qr, path: '/qr', icon: <PassIcon /> },
      { id: 'settings', label: copy.nav.settings, path: '/settings', icon: <ProfileIcon /> },
    ],
    []
  );

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
          <Route path="/qr" element={<QrPage />} />
          <Route path="/settings/*" element={<SettingsPage userEmail={userEmail} userPhotoURL={userPhotoURL} onSignOut={onSignOut} />} />
          <Route path="/ui" element={<UiDemoPage />} />

          {/* Backward-compat redirects */}
          <Route path="/credential" element={<Navigate to="/qr" replace />} />
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

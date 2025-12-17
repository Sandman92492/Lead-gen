import React, { useEffect, useMemo, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import CredentialPage from '../pages/CredentialPage';
import GuestsPage from '../pages/GuestsPage';
import OffersPage from '../pages/OffersPage';
import ProfilePage from '../pages/ProfilePage';
import AdminDashboard from './AdminDashboard';
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
        navigate('/credential', { replace: true });
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
      { id: 'credential', label: copy.nav.credential, path: '/credential', icon: <PassIcon /> },
      { id: 'guests', label: copy.nav.guests, path: '/guests', icon: <GuestsIcon /> },
      { id: 'offers', label: copy.nav.offers, path: '/offers', icon: <DealsIcon /> },
      { id: 'help', label: copy.nav.help, path: '/profile', icon: <ProfileIcon /> },
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
          <Route path="/credential" element={<CredentialPage />} />
          <Route path="/guests" element={<GuestsPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/profile" element={<ProfilePage userEmail={userEmail} userPhotoURL={userPhotoURL} onSignOut={onSignOut} />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Backward-compat redirects */}
          <Route path="/home" element={<Navigate to="/credential" replace />} />
          <Route path="/deals" element={<Navigate to="/offers" replace />} />
          <Route path="/all-deals" element={<Navigate to="/offers" replace />} />
          <Route path="*" element={<Navigate to="/credential" replace />} />
        </Routes>
      </div>
    </AppShell>
  );
};

export default SignedInTabsApp;

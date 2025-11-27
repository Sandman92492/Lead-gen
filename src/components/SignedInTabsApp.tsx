import React, { useMemo, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import MyPassPage from '../pages/MyPassPage';
import AllDealsPage from '../pages/AllDealsPage';
import ProfilePage from '../pages/ProfilePage';
import { HomeIcon, PassIcon, DealsIcon, ProfileIcon } from './TabIcons';
import { PassInfo } from '../context/AuthContext';
import { PassType } from '../types';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { haptics } from '../utils/haptics';

interface SignedInTabsAppProps {
    userState: 'signed-in' | 'signed-in-with-pass';
    pass: PassInfo | null;
    redeemedDeals: string[];
    user?: any;
    userEmail?: string;
    userPhotoURL?: string;
    onMainCta: () => void;
    onRedeemClick: (dealName: string) => void;
    onSignOut: () => void;
    onSelectPass?: (passType: PassType) => void;
    onPrivacyClick?: () => void;
    onTermsClick?: () => void;
    onCharityClick?: () => void;
    onFaqClick?: () => void;
}

const SignedInTabsApp: React.FC<SignedInTabsAppProps> = ({
    userState,
    pass,
    redeemedDeals,
    user,
    userEmail,
    userPhotoURL,
    onMainCta,
    onRedeemClick,
    onSignOut,
    onSelectPass,
    onPrivacyClick,
    onTermsClick,
    onCharityClick,
    onFaqClick,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const hasPass = userState === 'signed-in-with-pass' && pass !== null;
    const hasNavigatedRef = useRef(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Navigate to /home on first mount (when user signs in)
    useEffect(() => {
        if (!hasNavigatedRef.current && (location.pathname === '/' || location.pathname === '')) {
            hasNavigatedRef.current = true;
            navigate('/home', { replace: true });
        }
    }, [navigate]);

    // Scroll to top when route changes
    useEffect(() => {
        // Immediate scroll
        window.scrollTo(0, 0);
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
        // Ensure scroll happens after route renders
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 50);
    }, [location.pathname]);

    // Extract user's first name from pass holder name or Firebase displayName or email
    const getUserName = () => {
        // Priority 1: Use pass holder name if available
        if (pass?.passHolderName) {
            const firstName = pass.passHolderName.split(' ')[0];
            return firstName;
        }
        // Priority 2: Use Firebase displayName if available
        if (user?.displayName) {
            const firstName = user.displayName.split(' ')[0];
            return firstName;
        }
        // Priority 3: Fall back to email prefix
        if (userEmail) {
            const firstName = userEmail.split('@')[0];
            return firstName.charAt(0).toUpperCase() + firstName.slice(1);
        }
        return undefined;
    };

    const tabs = useMemo(() => [
        { id: 'home', label: 'Home', path: '/home', icon: <HomeIcon /> },
        { id: 'deals', label: 'All Deals', path: '/deals', icon: <DealsIcon /> },
        ...(hasPass ? [{ id: 'pass', label: 'My Pass', path: '/pass', icon: <PassIcon /> }] : []),
        { id: 'profile', label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
    ], [hasPass]);

    // Swipe navigation between tabs
    const currentTabIndex = useMemo(() => {
        return tabs.findIndex(tab => tab.path === location.pathname);
    }, [tabs, location.pathname]);

    useSwipeGesture(contentRef.current, {
        onSwipeLeft: () => {
            if (currentTabIndex < tabs.length - 1) {
                navigate(tabs[currentTabIndex + 1].path);
            }
        },
        onSwipeRight: () => {
            if (currentTabIndex > 0) {
                navigate(tabs[currentTabIndex - 1].path);
            }
        },
    });

    return (
        <>
            {/* Route handlers */}
            <div ref={contentRef} className="bg-bg-primary">
                <Routes>
                    <Route path="/home" element={
                        <HomePage 
                            hasPass={hasPass} 
                            userName={getUserName()} 
                            onSelectPass={onSelectPass} 
                            redeemedDeals={redeemedDeals}
                            onNavigateToDeal={() => navigate('/deals')}
                            pass={pass}
                            onRedeemClick={onRedeemClick}
                            onNavigateToPass={() => navigate('/pass')}
                        />
                    } />
                    {hasPass && (
                        <Route path="/pass" element={
                            <MyPassPage pass={pass} redeemedDeals={redeemedDeals} onViewPass={onMainCta} />
                        } />
                    )}
                    <Route path="/deals" element={
                        <AllDealsPage hasPass={hasPass} onRedeemClick={onRedeemClick} redeemedDeals={redeemedDeals} passExpiryDate={pass?.expiryDate} />
                    } />
                    <Route path="/profile" element={
                        <ProfilePage userEmail={userEmail} userPhotoURL={userPhotoURL} onSignOut={onSignOut} hasPass={hasPass} onPrivacyClick={onPrivacyClick} onTermsClick={onTermsClick} onCharityClick={onCharityClick} onFaqClick={onFaqClick} />
                    } />
                    {/* Redirect unknown routes to home */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </div>

            {/* Mobile bottom tabs */}
            {/* Render mobile tabs only */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-20 bg-bg-card border-t-8 border-brand-dark-blue md:hidden rounded-t-3xl shadow-lg"
                style={{ boxShadow: 'var(--box-shadow, 0 -4px 8px rgba(0, 0, 0, 0.1))' }}
            >
                <div className="flex justify-around items-center h-16 sm:h-20 gap-1 px-2">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                haptics.tap();
                                navigate(tab.path);
                            }}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 text-xs sm:text-sm font-semibold transition-all rounded-xl ${currentTabIndex === index
                                    ? 'text-action-primary bg-action-primary/10'
                                    : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {tab.icon && (
                                <div
                                    className={`h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center flex-shrink-0`}
                                    style={{
                                        filter: currentTabIndex === index
                                            ? `brightness(0) saturate(100%) invert(32%) sepia(65%) saturate(2000%) hue-rotate(175deg) brightness(1.1)`
                                            : 'brightness(0.5) opacity(0.7)'
                                    }}>
                                    {tab.icon}
                                </div>
                            )}
                            <span className="line-clamp-1">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </>
    );
};

export default SignedInTabsApp;

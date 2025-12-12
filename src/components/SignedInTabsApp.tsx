import React, { useMemo, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import DealsDirectoryV2 from '../pages/DealsDirectoryV2';
import ProfilePage from '../pages/ProfilePage';
import Footer from './Footer';
import { HomeIcon, DealsIcon, ProfileIcon } from './TabIcons';
import { PassInfo } from '../context/AuthContext';
import { PassType, Deal } from '../types';
import { useAllDeals } from '../hooks/useAllDeals';

import { haptics } from '../utils/haptics';

interface SignedInTabsAppProps {
    userState: 'signed-in' | 'signed-in-with-pass';
    pass: PassInfo | null;
    redeemedDeals: string[];
    user?: any;
    userEmail?: string;
    userPhotoURL?: string;
    isOnline?: boolean;
    onMainCta: () => void;
    onRedeemClick: (dealName: string) => void;
    onSignOut: () => void;
    onSelectPass?: (passType: PassType) => void;
    onBuyPassClick?: () => void;
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
    isOnline,
    onMainCta,
    onRedeemClick,
    onSignOut,
    onSelectPass,
    onBuyPassClick,
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
        if (!hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            // Always start on home page when signing in
            if (location.pathname !== '/home') {
                navigate('/home', { replace: true });
            }
        }
    }, [navigate, location.pathname]);

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

    // Build dealsByCategory for SuperHomeScreen
    const { deals: allDeals } = useAllDeals();
    const dealsByCategory = useMemo(() => {
        if (!allDeals || allDeals.length === 0) return [];

        const categoryMap: Record<string, Deal[]> = {};
        allDeals.forEach((deal) => {
            const cat = deal.category || 'Other';
            if (!categoryMap[cat]) categoryMap[cat] = [];
            categoryMap[cat].push(deal);
        });

        const emojiMap: Record<string, string> = {
            restaurant: '🍔',
            activity: '🛶',
            shopping: '🛍️',
            lifestyle: '✨',
            Other: '⭐',
        };

        const displayNameMap: Record<string, string> = {
            restaurant: 'Local Eats and Treats',
            activity: 'Activities and Adventure',
            shopping: 'Lifestyle and Wellness',
            lifestyle: 'Lifestyle and Wellness',
            Other: 'More Deals',
        };

        // Define category order: Restaurants, Activities, Shopping, Lifestyle, Other
        const categoryOrder = ['restaurant', 'activity', 'shopping', 'lifestyle', 'Other'];
        const sortedCategories = categoryOrder.filter(cat => categoryMap[cat] || cat === 'Other');

        return sortedCategories.map((category) => {
            const deals = categoryMap[category] || [];
            return {
                category: displayNameMap[category] || category.charAt(0).toUpperCase() + category.slice(1),
                emoji: emojiMap[category] || '⭐',
                deals: deals.slice(0, 10), // Limit to 10 per category
            };
        });
    }, [allDeals]);

    const tabs = useMemo(() => [
        { id: 'home', label: 'Home', path: '/home', icon: <HomeIcon /> },
        { id: 'deals', label: 'Deals', path: '/deals', icon: <DealsIcon /> },
        { id: 'profile', label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
    ], []);

    const currentTabIndex = useMemo(() => {
        return tabs.findIndex(tab => tab.path === location.pathname);
    }, [tabs, location.pathname]);


    return (
        <>
            {/* Route handlers */}
            <div ref={contentRef} className="bg-bg-primary">
                <Routes>
                    <Route path="/home" element={
                        <HomePage 
                            hasPass={hasPass} 
                            userName={getUserName()} 
                            userPhotoURL={userPhotoURL}
                            onSelectPass={onSelectPass} 
                            redeemedDeals={redeemedDeals}
                            onNavigateToDeal={() => navigate('/deals')}
                            pass={pass}
                            onRedeemClick={onRedeemClick}
                            dealsByCategory={dealsByCategory}
                            useSuperHome={true}
                            onBuyPassClick={onBuyPassClick}
                            isOnline={isOnline}
                        />
                    } />
                    <Route path="/deals" element={
                        <DealsDirectoryV2 hasPass={hasPass} onRedeemClick={onRedeemClick} redeemedDeals={redeemedDeals} passExpiryDate={pass?.expiryDate} onBuyPassClick={onBuyPassClick} />
                    } />
                    <Route path="/profile" element={
                        <ProfilePage userEmail={userEmail} userPhotoURL={userPhotoURL} onSignOut={onSignOut} hasPass={hasPass} redeemedDeals={redeemedDeals} onPrivacyClick={onPrivacyClick} onTermsClick={onTermsClick} onCharityClick={onCharityClick} onFaqClick={onFaqClick} />
                    } />
                    {/* Backward compatibility redirects */}
                    <Route path="/all-deals" element={<Navigate to="/deals" replace />} />
                    {/* Redirect unknown routes to home */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </div>

            {/* Desktop footer (hidden on mobile) */}
            <div className="hidden md:block">
                <Footer
                    onButtonClick={onBuyPassClick || onMainCta}
                    buttonText="Get My Pass"
                    hasPass={hasPass}
                    onPrivacyClick={onPrivacyClick}
                    onTermsClick={onTermsClick}
                />
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

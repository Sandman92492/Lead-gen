import React, { useState, useEffect, useRef } from 'react';
import Button from './Button.tsx';
import { useTheme } from './ThemeContext.tsx';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { haptics } from '../utils/haptics';
import { isPWAPromptAvailable, showPWAPrompt, onPromptAvailabilityChange } from '../utils/pwaPrompt';

export interface TabItem {
    id: string;
    label: string;
    path: string;
    icon?: React.ReactNode;
}

interface HeaderProps {
    onButtonClick: () => void;
    buttonText: string;
    onAuthClick?: () => void;
    onSignOutClick?: () => void;
    onActivateClick?: () => void;
    isAuthenticated?: boolean;
    userEmail?: string;
    userPhotoURL?: string;
    isSignedIn?: boolean;
    tabs?: TabItem[];
    currentPath?: string;
    onTabClick?: (path: string) => void;
}

const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="w-10 h-10" />; // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-action-primary hover:bg-bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ onButtonClick, buttonText, onAuthClick, onSignOutClick, onActivateClick: _onActivateClick, isAuthenticated, userEmail, userPhotoURL, isSignedIn, tabs, currentPath, onTabClick }) => {
    const { theme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial check
        const available = isPWAPromptAvailable();
        setShowInstallPrompt(available);

        // Subscribe to availability changes
        const unsubscribe = onPromptAvailabilityChange(() => {
            const isNowAvailable = isPWAPromptAvailable();
            setShowInstallPrompt(isNowAvailable);
        });

        return unsubscribe;
    }, []);

    const toggleMenu = () => {
        haptics.tap();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    };

    const handleCtaClick = () => {
        onButtonClick();
        setIsMenuOpen(false);
    };

    // Add border on scroll
    useEffect(() => {
        const handleScroll = () => {
            // Show sticky CTA after scrolling past How It Works section
            const howItWorksSection = document.getElementById('how-it-works');
            if (howItWorksSection) {
                const sectionBottom = howItWorksSection.offsetTop + howItWorksSection.offsetHeight;
                setIsScrolled(window.scrollY > sectionBottom);
            } else {
                // Fallback: trigger after scrolling past hero (90vh)
                setIsScrolled(window.scrollY > (window.innerHeight * 0.9));
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMenuOpen]);

    // Swipe down to close menu
    useSwipeGesture(isMenuOpen ? menuRef.current : null, {
        onSwipeDown: () => {
            setIsMenuOpen(false);
        },
    }, 30);

    const navLinks: Array<{ name: string; id: string }> = [];

    const whatsappUrl = `https://wa.me/27799569040`;

    return (
        <>
            <header className={`sticky top-0 z-30 bg-bg-primary transition-all duration-300 ${isScrolled ? 'shadow-lg border-b border-border-subtle' : ''}`} style={{ position: 'sticky', top: 0, zIndex: 30 }}>
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center md:flex-1">
                        <img
                            src={theme === 'dark' ? '/Images/logo-ocean.svg' : '/Images/logo-sand.svg'}
                            alt="Raffle Tickets Logo"
                            className="h-16 w-auto"
                        />
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8 flex-1 justify-between">
                        {/* Tabs (if authenticated) */}
                        {tabs && tabs.length > 0 && (
                            <nav className="flex items-center gap-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            haptics.tap();
                                            onTabClick?.(tab.path);
                                        }}
                                        className={`px-3 py-2 font-semibold text-sm transition-colors border-b-2 ${currentPath === tab.path
                                                ? 'border-action-primary text-action-primary'
                                                : 'border-transparent text-text-secondary hover:text-text-primary'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        )}

                        {/* Right side controls */}
                        <nav className="flex items-center space-x-8">
                            <ThemeToggleButton />
                            {isAuthenticated ? (
                                <>
                                    <Button onClick={onButtonClick} variant="primary" size="sm" className="whitespace-nowrap">{buttonText}</Button>
                                    <div className="relative w-10 h-10">
                                        <div className="absolute inset-0 rounded-full bg-action-primary flex items-center justify-center text-white font-semibold text-sm">
                                          {userEmail?.charAt(0).toUpperCase()}
                                        </div>
                                        {userPhotoURL && (
                                          <img
                                            src={userPhotoURL}
                                            alt={userEmail || 'User profile'}
                                            className="absolute inset-0 w-10 h-10 rounded-full object-cover border-2 border-action-primary"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                          />
                                        )}
                                      </div>
                                    <Button onClick={onSignOutClick} variant="outline" size="sm" className="whitespace-nowrap">Sign Out</Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={onAuthClick} variant="outline" size="sm" className="whitespace-nowrap">Sign In</Button>
                                    <Button onClick={onButtonClick} variant="primary" size="sm">{buttonText}</Button>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Theme Toggle (Mobile) */}
                    <div className="md:hidden">
                        <ThemeToggleButton />
                    </div>
                </div>
                {/* Sticky CTA bar - shows when scrolled for non-authenticated users */}
                {!isAuthenticated && (
                    <div className={`border-t border-border-subtle bg-bg-card/95 backdrop-blur-sm transition-all duration-500 ease-out ${
                        isScrolled ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                        <div className="container mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
                            <p className="text-sm text-text-secondary hidden sm:block">
                                <span className="font-semibold text-text-primary">Ticket Pack</span> – Enter raffles for schools/fundraisers
                            </p>
                            <p className="text-sm text-text-secondary sm:hidden">
                                <span className="font-semibold text-text-primary">Get the Ticket Pack</span>
                            </p>
                            <Button onClick={onButtonClick} variant="primary" size="sm" className="flex-shrink-0">
                                {buttonText}
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            {/* Mobile Menu Bar - Bottom Trigger (only for free users) */}
            {!isSignedIn && (
                <button
                    onClick={toggleMenu}
                    className="fixed bottom-0 left-0 right-0 md:hidden z-40 w-full px-8 py-6 bg-bg-card/95 backdrop-blur text-text-primary font-bold text-lg flex items-center justify-center gap-3 rounded-t-[var(--radius)] shadow-[var(--shadow)] border-t border-border-subtle hover:bg-bg-card transition-colors"
                    aria-label="Open menu"
                    aria-expanded={isMenuOpen}
                >
                    <svg className="h-8 w-8 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7-7m0 0l-7 7m7-7v12" />
                    </svg>
                    <span>Menu</span>
                </button>

            )}

            {/* Mobile Menu Bottom Sheet */}
            {!isSignedIn && (
                <div
                    className={`fixed inset-0 modal-backdrop z-40 transition-opacity duration-300 ease-in-out md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={toggleMenu}
                    role="dialog"
                    aria-modal="true"
                    {...(!isMenuOpen && { inert: '' })}
                >
                    <div
                        ref={menuRef}
                        className={`absolute bottom-0 left-0 right-0 bg-bg-card shadow-[var(--shadow)] rounded-t-[var(--radius)] border border-border-subtle transform transition-transform duration-300 ease-in-out max-h-[90vh] overflow-y-auto ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Handle bar for bottom sheet indication */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1 bg-border-subtle rounded-full"></div>
                        </div>

                        <div className="flex justify-center items-center px-6 pb-6">
                            <h2 className="text-2xl font-display font-black text-text-primary">Menu</h2>
                            <div className="absolute right-6">
                                <ThemeToggleButton />
                            </div>
                        </div>

                        <nav className="flex flex-col space-y-8 px-6 pb-4 text-center">
                            {navLinks.map(link => (
                                <a key={link.id} href={`#${link.id}`} onClick={(e) => { e.preventDefault(); handleLinkClick(link.id); }} className="text-action-primary font-display text-4xl font-extrabold hover:text-urgency-high transition-colors">
                                    {link.name}
                                </a>
                            ))}

                            {/* Auth Section */}
                            <div className="border-t-2 border-action-primary/20 pt-8 mt-8">
                                {isAuthenticated ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-6 px-2 py-2">
                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                <div className="absolute inset-0 rounded-full bg-action-primary flex items-center justify-center text-white font-semibold text-lg">
                                                  {userEmail?.charAt(0).toUpperCase()}
                                                </div>
                                                {userPhotoURL && (
                                                  <img
                                                    src={userPhotoURL}
                                                    alt={userEmail || 'User profile'}
                                                    className="absolute inset-0 w-12 h-12 rounded-full object-cover border-2 border-action-primary"
                                                    onError={(e) => {
                                                      (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                  />
                                                )}
                                              </div>
                                            <span className="text-text-primary text-sm font-semibold truncate">{userEmail}</span>
                                        </div>
                                        <div className="space-y-4">
                                            <Button onClick={handleCtaClick} variant="primary" className="w-full py-4 text-lg font-bold">
                                                {buttonText}
                                            </Button>
                                            <Button onClick={() => { onSignOutClick?.(); toggleMenu(); }} variant="outline" className="w-full py-4 text-lg font-bold">
                                                Sign Out
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <Button onClick={() => { onAuthClick?.(); toggleMenu(); }} variant="outline" className="w-full py-4 text-lg font-bold">
                                            Sign In
                                        </Button>
                                        <Button onClick={handleCtaClick} variant="primary" className="w-full py-4 text-lg font-bold">
                                            {buttonText}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Install App Button */}
                            {showInstallPrompt && (
                                <div className="border-t-2 border-action-primary/20 pt-8 mt-8">
                                    <button
                                        onClick={async () => {
                                            await showPWAPrompt();
                                            setShowInstallPrompt(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white bg-action-primary hover:brightness-110 transition-all font-semibold"
                                        aria-label="Install Raffle Tickets app"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                            <polyline points="16 6 12 2 8 6"></polyline>
                                            <line x1="12" y1="2" x2="12" y2="15"></line>
                                        </svg>
                                        <span>Install App</span>
                                    </button>
                                </div>
                            )}

                            {/* WhatsApp Support */}
                            <div className={`${showInstallPrompt ? '' : 'border-t-2 border-action-primary/20 pt-8 mt-8'} pb-8`}>
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white bg-[#25D366] hover:brightness-110 transition-all font-semibold"
                                    aria-label="Chat with us on WhatsApp"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                    </svg>
                                    <span>WhatsApp Support</span>
                                </a>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;

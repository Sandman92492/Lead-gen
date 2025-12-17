import React, { useState, useEffect } from 'react';
import Button from './Button.tsx';
import { useTheme } from './ThemeContext.tsx';
import { haptics } from '../utils/haptics';
import { copy } from '../copy';

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const toggleMenu = () => {
        haptics.tap();
        setIsMenuOpen(!isMenuOpen);
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

    return (
        <>
            <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled ? 'glass-panel shadow-sm py-2' : 'bg-transparent py-4'}`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo Area - Text based for Premium Feel */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                            <div className="w-8 h-8 rounded-lg bg-action-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-action-primary/20">
                                E
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="font-display font-bold text-lg tracking-tight text-text-primary">
                                    Estate<span className="text-action-primary">Pass</span>
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-semibold">Access</span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        {isAuthenticated && tabs && tabs.length > 0 && (
                            <div className="hidden md:flex items-center space-x-1 bg-bg-primary/70 backdrop-blur-md px-2 py-1.5 rounded-full border border-border-subtle shadow-sm">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            haptics.tap();
                                            onTabClick?.(tab.path);
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${currentPath === tab.path
                                            ? 'bg-bg-card text-action-primary shadow-sm font-bold'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/70'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block">
                                <ThemeToggleButton />
                            </div>

                            {isAuthenticated ? (
                                <div className="flex items-center gap-3 pl-4 border-l border-border-subtle/50">
                                    <div className="text-right hidden lg:block">
                                        <div className="text-xs font-bold text-text-primary truncate max-w-[100px]">{userEmail?.split('@')[0]}</div>
                                        <div className="text-[10px] text-text-secondary uppercase tracking-wider">Resident</div>
                                    </div>
                                    <button
                                        onClick={onSignOutClick}
                                        className="relative w-9 h-9 rounded-full bg-bg-card border border-border-subtle shadow-sm flex items-center justify-center text-text-secondary hover:text-alert hover:border-alert hover:bg-alert/10 transition-all focus:outline-none focus:ring-2 focus:ring-action-primary/20"
                                        aria-label="Sign out"
                                    >
                                        {userPhotoURL ? (
                                            <img src={userPhotoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-xs">{userEmail?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Button onClick={onAuthClick} variant="outline" size="sm" className="hidden sm:flex">Sign In</Button>
                                    <Button onClick={onButtonClick} variant="primary" size="sm">{buttonText}</Button>
                                </div>
                            )}

                            {/* Mobile Menu Toggle */}
                            {!isSignedIn && (
                                <button
                                    onClick={toggleMenu}
                                    className="md:hidden p-2 text-text-primary focus:outline-none"
                                    aria-label="Toggle menu"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && !isSignedIn && (
                <div className="fixed inset-0 z-30 bg-bg-primary/95 backdrop-blur-xl md:hidden flex flex-col pt-24 px-6 animate-fade-in">
                    <nav className="flex flex-col space-y-6 text-center">
                        <Button onClick={() => { onAuthClick?.(); setIsMenuOpen(false); }} variant="outline" size="lg" className="w-full justify-center">
                            Sign In
                        </Button>
                        <Button onClick={() => { onButtonClick?.(); setIsMenuOpen(false); }} variant="primary" size="lg" className="w-full justify-center">
                            {buttonText}
                        </Button>

                        <div className="pt-8 border-t border-border-subtle/30 mt-4">
                            <div className="flex justify-center mb-6">
                                <ThemeToggleButton />
                            </div>
                            <a href={`https://wa.me/${copy.support.whatsappNumberE164}`} className="text-sm font-semibold text-text-secondary flex items-center justify-center gap-2">
                                <span>Need help? Chat on WhatsApp</span>
                            </a>
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
};

export default Header;

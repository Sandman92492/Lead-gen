import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useTheme } from './ThemeContext.tsx';
import { PassType } from '../types.ts';
import { isPassExpired, getExpiryStatus } from '../utils/passExpiry';

interface PassProps {
    name: string;
    passId: string;
    onClose: () => void;
    onCardClick?: () => void;
    isNew: boolean;
    passType?: PassType | 'annual'; // Allow 'annual' from legacy data
    expiryDate: string;
    userEmail?: string;
}

const Pass: React.FC<PassProps> = ({ name, passId, onClose, onCardClick, isNew, passType = 'holiday', expiryDate }) => {
    const { theme } = useTheme();
    const [time, setTime] = useState(new Date());
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(isNew);


    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        if (isNew) {
            const confettiTimer = setTimeout(() => setShowConfetti(false), 8000);
            return () => clearTimeout(confettiTimer);
        }
    }, [isNew]);



    const formattedExpiryDate = new Date(expiryDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).toUpperCase();

    const passIsExpired = isPassExpired(expiryDate);
    const expiryStatusMessage = getExpiryStatus(expiryDate);

    const getConfettiColors = () => {
        if (typeof window === 'undefined') return ['#FFD166', '#FF8C69', '#FFFFFF'];
        const root = getComputedStyle(document.documentElement);
        const yellow = root.getPropertyValue('--color-brand-yellow').trim() || '#FFD166';
        const red = root.getPropertyValue('--color-brand-red').trim() || '#FF8C69';
        return [yellow, red, '#FFFFFF'];
    };

    return (
        <div className="modal-backdrop flex items-center justify-center z-50 p-4" onClick={onClose}>
            {showConfetti && width > 0 && height > 0 && <Confetti width={width} height={height} recycle={false} numberOfPieces={400} colors={getConfettiColors()} />}
            <div
                className={`relative text-brand-white w-full max-w-sm aspect-[9/16] rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 flex flex-col justify-between border-4 drop-shadow-2xl ${passIsExpired ? 'border-red-500' : 'border-brand-yellow'} ${isNew && onCardClick ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : ''}`}
                style={{ background: passIsExpired ? 'linear-gradient(135deg, #4a2020 0%, #6b0000 50%, #4a2020 100%)' : 'linear-gradient(135deg, var(--color-brand-dark-blue) 0%, #004A7A 50%, var(--color-brand-dark-blue) 100%)' }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isNew && onCardClick) {
                        onCardClick();
                    }
                }}
            >
                {/* Texture overlay for authenticity */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noise\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" seed=\"1\"/></filter><rect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"1\"/></svg>')" }} >
                </div>



                {passType === 'annual' && !passIsExpired && (
                    <div className="absolute top-0 right-0 bg-brand-red text-white text-xs font-bold py-1 px-4 rounded-bl-lg z-20 shadow-lg">VIP</div>
                )}

                {passIsExpired && (
                    <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold py-2 text-center z-20 shadow-lg">
                        PASS EXPIRED
                    </div>
                )}



                <button onClick={onClose} className="absolute top-4 right-4 text-brand-white/70 hover:text-brand-white transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-[var(--color-action-primary)] rounded-md p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <header className="text-center relative z-10 mb-6">
                    <h2 className="text-xs md:text-sm font-semibold text-brand-yellow uppercase tracking-widest mb-4">
                        Your Exclusive Pass
                    </h2>
                    <div className="mx-auto mb-6 w-20 h-20 flex-shrink-0 rounded-2xl p-2" aria-label="Port Alfred Holiday Pass Logo Icon">
                        <img 
                          src={theme === 'dark' ? '/Images/logo-ocean.svg' : '/Images/logo-sand.svg'} 
                          alt="Port Alfred Holiday Pass Logo"
                          className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="font-display text-brand-white text-xl sm:text-2xl mb-1">Port Alfred</h1>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-brand-yellow">HOLIDAY PASS</h2>
                </header>

                <main className="text-center my-auto relative z-10 space-y-3">
                    <p className="text-brand-red text-xs sm:text-sm font-semibold tracking-widest uppercase">Pass Holder</p>
                    <p className="font-display text-3xl sm:text-4xl font-bold break-words text-brand-yellow drop-shadow-md">{name}</p>
                </main>

                <footer className="text-center relative z-10 space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                     <div className="border-t-2 border-dashed border-brand-yellow/40"></div>
                     <div className="space-y-2 sm:space-y-3 text-center text-sm">
                         <div>
                             <p className="text-brand-red text-xs font-semibold tracking-wider uppercase">Pass ID</p>
                             <p className="font-mono text-xs text-brand-white/80 mt-0.5">{passId}</p>
                         </div>
                         <div>
                             <p className="text-brand-red text-xs font-semibold tracking-wider uppercase">Valid Until</p>
                             <p className="font-mono text-xs text-brand-white/80 mt-0.5">{formattedExpiryDate}</p>
                             <p className={`text-xs font-semibold mt-1 ${passIsExpired ? 'text-red-400' : 'text-brand-yellow'}`}>
                                 {expiryStatusMessage}
                             </p>
                         </div>
                     </div>
                     <div className="pt-1 sm:pt-2">
                         <div className="flex items-center justify-center gap-1 sm:gap-2" aria-live="off" title="Live verification indicator">
                             <div className="w-2 h-2 rounded-full bg-brand-red animate-live-pulse" aria-hidden="true"></div>
                             <p className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider text-brand-yellow">
                                 {time.toLocaleTimeString('en-GB')}
                             </p>
                             <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                             </svg>
                         </div>
                         <p className="text-center text-xs text-brand-white/50 mt-1 sm:mt-2">Show this screen to Redeem</p>
                     </div>
                     <div className="flex justify-center pt-1 sm:pt-3">
                         <div className="flex items-center gap-1.5 bg-brand-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-brand-yellow/30">
                             <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                             </svg>
                             <span className="text-brand-yellow text-xs font-semibold uppercase tracking-wider">Verified</span>
                         </div>
                     </div>
                 </footer>
            </div>
        </div>
    );
};

export default Pass;

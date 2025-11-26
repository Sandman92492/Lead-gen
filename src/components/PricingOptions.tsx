import React, { useState, useEffect } from 'react';
import Button from './Button.tsx';
import { PassType, PassFeatures } from '../types.ts';
import { getPassPrice, getPassFeatures } from '../utils/pricing';

interface PricingOptionsProps {
    onSelectPass?: (passType: PassType) => void;
}

const PricingOptions: React.FC<PricingOptionsProps> = ({ onSelectPass }) => {
    const [isTestPaymentLoading, setIsTestPaymentLoading] = useState(false);
    const [passPrice, setPassPrice] = useState({ price: 199, cents: 19900, launchPricing: false });
    const [features, setFeatures] = useState<PassFeatures>({
        description: 'Discover and support Port Alfred\'s best local venues while enjoying great deals and authentic experiences.',
        feature1: 'Discover 70+ local venues and businesses',
        feature2: 'Support independent Port Alfred businesses',
        feature3: 'Enjoy verified savings and great experiences',
        venueCount: 70
    });

    // Load dynamic price and features on mount
    useEffect(() => {
        const loadData = async () => {
            const price = await getPassPrice();
            const passFeatures = await getPassFeatures();
            setPassPrice(price);
            setFeatures(passFeatures);
        };
        loadData();
    }, []);

    const handleJoinWaitingList = () => {
        window.open('https://chat.whatsapp.com/HRSAKdexnaR0FkzGohcLqX', '_blank');
    };

    const handleTestPayment = () => {
        if (onSelectPass) {
            setIsTestPaymentLoading(true);
            onSelectPass('holiday');
        }
    };

    return (
        <section id="pricing-options" className="py-20 md:py-32 bg-bg-primary">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center mb-16 scroll-reveal">
                    <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 md:mb-5">
                        Select Your Plan
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary mb-4 md:mb-6">Support Local Port Alfred</h1>
                    <p className="text-lg md:text-xl text-text-secondary mb-8 md:mb-10">Get great deals while discovering and supporting the businesses that make our town thrive.</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="max-w-2xl mx-auto">
                        {/* Holiday Pass */}
                        <div className="border-2 border-action-primary bg-bg-card rounded-2xl p-6 sm:p-8 flex flex-col scroll-reveal relative">
                            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-action-primary text-white dark:bg-action-primary dark:text-white font-bold text-sm px-4 py-1 rounded-full shadow-lg">
                                The Only Pass
                            </div>
                            <h3 className="text-3xl font-display font-black text-text-primary text-center mb-4">Holiday Pass</h3>

                            <div className="text-center mb-6">
                                <div>
                                    <span className="text-5xl font-display font-black text-action-primary">R{passPrice.price}</span>
                                    {passPrice.launchPricing && (
                                        <>
                                            <span className="block text-sm text-urgency-high font-bold mt-1">🎉 Launch Pricing!</span>
                                            <span className="block text-xs text-urgency-high mt-1">From Nov 30 • Limited to first 50 users</span>
                                        </>
                                    )}
                                    <span className="text-text-secondary block text-sm mt-2">Dec 1 - Jan 31</span>
                                </div>
                            </div>

                            <p className="text-text-secondary text-center mb-6">{features.description}</p>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start text-text-secondary">
                                    <span className="text-action-primary mr-3 font-bold">✓</span>
                                    <span>{features.feature1}</span>
                                </li>
                                <li className="flex items-start text-text-secondary">
                                    <span className="text-action-primary mr-3 font-bold">✓</span>
                                    <span>{features.feature2}</span>
                                </li>
                                <li className="flex items-start text-text-secondary">
                                    <span className="text-action-primary mr-3 font-bold">✓</span>
                                    <span>{features.feature3}</span>
                                </li>
                            </ul>

                            <div className="border-t border-border-subtle pt-4 mt-auto space-y-2 text-center text-sm text-text-secondary mb-4">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 text-action-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Instant digital access</span>
                                </div>
                            </div>

                            <div className="pt-3 space-y-3">
                                <Button
                                    variant="primary"
                                    className="w-full text-lg py-3 transform transition-transform duration-300 hover:scale-105 animate-subtle-pulse disabled:animate-none"
                                    onClick={handleJoinWaitingList}
                                >
                                    Join Waiting List
                                </Button>
                                {/* Test Payment Button - Remove before launch */}
                                <Button
                                    variant="secondary"
                                    className="w-full text-lg py-3 opacity-75"
                                    onClick={handleTestPayment}
                                    disabled={isTestPaymentLoading}
                                >
                                    {isTestPaymentLoading ? 'Processing...' : `Test Payment (R${passPrice.price})`}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </section>
    );
};

export default PricingOptions;

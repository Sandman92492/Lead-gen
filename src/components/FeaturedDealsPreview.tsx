import React from 'react';
import { useAllDeals } from '../hooks/useAllDeals';
import FeaturedDealCard from './FeaturedDealCard';

interface FeaturedDealsPreviewProps {
    hasPass: boolean;
    onRedeemClick: (dealName: string) => void;
    redeemedDeals: string[];
    passExpiryDate?: string; // Pass expiry date to check if expired
    onViewAllDeals?: () => void;
}

const FeaturedDealsPreview: React.FC<FeaturedDealsPreviewProps> = ({
    hasPass,
    onRedeemClick,
    redeemedDeals,
    passExpiryDate,
    onViewAllDeals,
}) => {
    const { deals: allDeals, isLoading } = useAllDeals();
    const deals = allDeals.filter(deal => deal.featured);

    const isRedeemed = (dealName: string) => redeemedDeals.includes(dealName);

    return (
        <section className="py-12 sm:py-16 bg-bg-primary">
            <div className="container mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h3 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-3">
                        Featured Deals
                    </h3>
                    <p className="text-2xl md:text-3xl font-display font-black text-accent-primary">
                        Top Rated Experiences
                    </p>
                </div>

                {isLoading && (
                    <p className="text-center text-text-secondary">Loading featured deals...</p>
                )}

                {!isLoading && deals.length === 0 && (
                    <p className="text-center text-text-secondary">No featured deals yet.</p>
                )}

                {/* Featured Deals Grid - 3 columns on desktop, 1 on mobile */}
                {!isLoading && deals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deals.map((deal, index) => (
                        <FeaturedDealCard
                            key={deal.name}
                            deal={deal}
                            index={index}
                            hasPass={hasPass}
                            isRedeemed={isRedeemed(deal.name)}
                            passExpiryDate={passExpiryDate}
                            onRedeemClick={onRedeemClick}
                            cardHeight="h-80"
                        />
                    ))}
                </div>
                )}

                {/* Call to Action */}
                <div className="text-center mt-10">
                    <p className="text-text-secondary mb-4">
                        Browse {hasPass ? 'all available' : 'more exclusive'} deals
                    </p>
                    <button
                        onClick={onViewAllDeals || (() => document.getElementById('full-deal-list')?.scrollIntoView({ behavior: 'smooth' }))}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-action-primary text-white font-bold hover:brightness-110 transition-all shadow-lg"
                    >
                        View All Deals
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FeaturedDealsPreview;

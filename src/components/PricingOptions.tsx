import React, { useState, useEffect, useMemo } from 'react';
import Button from './Button.tsx';
import Badge from './ui/Badge';
import Card from './ui/Card';
import { PassType, PassFeatures } from '../types.ts';
import { getPassPrice, getPassFeatures } from '../utils/pricing';
import { useAllDeals } from '../hooks/useAllDeals';

interface PricingOptionsProps {
    onSelectPass?: (passType: PassType) => void;
    passPrice?: { price: number; cents: number; launchPricing: boolean };
}

const PricingOptions: React.FC<PricingOptionsProps> = ({ onSelectPass, passPrice: propPassPrice }) => {
    const [isTestPaymentLoading, setIsTestPaymentLoading] = useState(false);
    const [localPassPrice, setLocalPassPrice] = useState({ price: 199, cents: 19900, launchPricing: false });
    const [features, setFeatures] = useState<PassFeatures>({
        description: 'Support schools and fundraisers by entering raffles and tracking your entries in one place.',
        feature1: 'Enter raffles from schools/fundraisers',
        feature2: 'Support the causes you care about',
        feature3: 'Verified entries with staff PIN',
        venueCount: 0
    });

    const { deals: allDeals = [] } = useAllDeals();
    const venueCount = useMemo(() => {
        const vendorIds = new Set(allDeals.map((deal) => deal.vendorId).filter(Boolean));
        return vendorIds.size;
    }, [allDeals]);

    const feature1Text = venueCount > 0
        ? `Enter raffles from ${venueCount}+ schools/fundraisers`
        : 'Enter raffles from schools/fundraisers';

    // Use prop if provided, otherwise use local state
    const passPrice = propPassPrice || localPassPrice;

    // Load dynamic price and features on mount (only if not provided via props)
    useEffect(() => {
        const loadData = async () => {
            if (!propPassPrice) {
                const price = await getPassPrice();
                setLocalPassPrice(price);
            }
            const passFeatures = await getPassFeatures();
            setFeatures(passFeatures);
        };
        loadData();
    }, [propPassPrice]);

    const handleTestPayment = () => {
        if (onSelectPass) {
            setIsTestPaymentLoading(true);
            onSelectPass('holiday');
        }
    };

    return (
        <section id="pricing-options" className="py-16 md:py-24 bg-bg-primary">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                    <div className="lg:col-span-5">
                        <div className="scroll-reveal">
                            <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-[0.2em] mb-3">
                                Ticket Pack
                            </h2>
                            <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary mb-4 tracking-tight">
                                Support the fundraiser.
                                <span className="block text-action-primary">Win prizes.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                                One purchase unlocks entries across our prize raffles — tracked and verified digitally.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-2">
                                <Badge variant="neutral">Secure checkout</Badge>
                                <Badge variant="neutral">Verified entries</Badge>
                                <Badge variant="neutral">Instant digital access</Badge>
                            </div>

                            <ul className="mt-8 space-y-3">
                                <li className="flex items-start gap-3 text-text-secondary">
                                    <span className="mt-0.5 text-success font-bold">✓</span>
                                    <span>{feature1Text}</span>
                                </li>
                                <li className="flex items-start gap-3 text-text-secondary">
                                    <span className="mt-0.5 text-success font-bold">✓</span>
                                    <span>{features.feature2}</span>
                                </li>
                                <li className="flex items-start gap-3 text-text-secondary">
                                    <span className="mt-0.5 text-success font-bold">✓</span>
                                    <span>{features.feature3}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <Card className="relative overflow-hidden scroll-reveal" padding="lg">
                            <div className="absolute inset-x-0 top-0 h-1 bg-action-primary/70" aria-hidden="true" />
                            <div className="flex items-center justify-between gap-3 mb-6">
                                <div className="flex items-center gap-2">
                                    <Badge variant="brand" size="sm">Official fundraiser</Badge>
                                    {passPrice.launchPricing && (
                                        <Badge variant="accent" size="sm">Early supporter pricing</Badge>
                                    )}
                                </div>
                                <span className="text-xs text-text-secondary">One pack • Multiple entries</span>
                            </div>

                            <h3 className="text-3xl sm:text-4xl font-display font-black text-text-primary tracking-tight">
                                Ticket Pack
                            </h3>
                            <p className="mt-2 text-text-secondary">
                                {features.description}
                            </p>

                            <div className="text-center mb-6">
                                <div>
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <span className="text-5xl font-display font-black text-action-primary">R{passPrice.price}</span>
                                        {passPrice.launchPricing && (
                                            <span className="text-text-secondary line-through text-2xl">R199</span>
                                        )}
                                    </div>
                                    {passPrice.launchPricing && (
                                        <>
                                            <span className="block text-sm text-urgency-high font-bold mt-1">Limited-time supporter pricing.</span>
                                        </>
                                    )}
                                    <span className="text-text-secondary block text-sm mt-2">Valid for the current fundraiser period</span>
                                </div>
                            </div>

                            <div className="border-t border-border-subtle pt-4 mt-auto space-y-2 text-center text-sm text-text-secondary mb-4">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 text-action-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Instant digital access</span>
                                </div>
                            </div>

                            <div className="pt-3">
                                <Button
                                    variant="primary"
                                    className="w-full text-lg py-3 transform transition-transform duration-300 hover:scale-105 animate-subtle-pulse disabled:animate-none"
                                    onClick={handleTestPayment}
                                    disabled={isTestPaymentLoading}
                                >
                                    {isTestPaymentLoading ? 'Processing...' : `Buy Ticket Pack (R${passPrice.price})`}
                                </Button>
                                <div className="mt-3 flex items-center justify-center gap-3 text-text-secondary/70">
                                    <span className="text-[10px] font-semibold uppercase tracking-wide">visa</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wide">mastercard</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wide">apple pay</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wide">google pay</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingOptions;

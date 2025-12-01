

import React from 'react';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            title: 'Get the Pass',
            description: 'One secure payment gives you access to all deals from Dec 1st to Jan 31st.',
        },
        {
            title: 'Flash Your Phone',
            description: 'Login to the app and show your digital pass at any partner venue. No awkward codes required.',
        },
        {
            title: 'Save Instantly',
            description: 'The staff verifies your pass, and the discount comes off your bill immediately. Easy.',
        },
    ];

    return (
        <section id="how-it-works" className="py-20 md:py-32 bg-bg-card">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center mb-16 scroll-reveal">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-action-primary mb-4 md:mb-6">Howzit Work?</h1>
                    <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 md:mb-10">No printing. No paper coupons. Discover hidden gems and save instantly on your phone.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {steps.map((step, index) => (
                        <div key={index} className="text-left scroll-reveal" style={{ transitionDelay: `${index * 150}ms` }}>
                            <div className="flex items-center mb-4">
                                <div className="text-5xl font-display font-black text-action-primary">
                                    0{index + 1}
                                </div>
                                <h3 className="text-2xl font-display font-black text-accent-primary ml-4">{step.title}</h3>
                            </div>
                            <p className="text-text-secondary leading-relaxed md:pl-16">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;

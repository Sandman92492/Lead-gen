

import React from 'react';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            title: 'Get Your Pass',
            description: <>Purchase the <span className="font-bold">Holiday Pass</span> and unlock access to Port Alfred's best local venues and experiences.</>,
        },
        {
            title: 'Explore & Discover',
            description: 'Browse venues, read about what makes each special, and discover the heart of Port Alfred.',
        },
        {
            title: 'Save While Supporting Local',
            description: 'Enjoy great deals while supporting the independent businesses that make our town thrive.',
        },
    ];

    return (
        <section id="how-it-works" className="py-20 md:py-32 bg-bg-card">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center mb-16 scroll-reveal">
                    <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 md:mb-5">
                        Three Simple Steps
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-accent-primary mb-4 md:mb-6">Howzit Work?</h1>
                    <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 md:mb-10">Discover Port Alfred's best venues and support local businesses while saving</p>
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

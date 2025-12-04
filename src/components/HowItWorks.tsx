

import React from 'react';

// SVG Icons for each step
const TicketIcon = () => (
  <svg className="w-10 h-10 text-action-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-10 h-10 text-action-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const SavingsIcon = () => (
  <svg className="w-10 h-10 text-action-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HowItWorks: React.FC = () => {
    const steps = [
        {
            icon: <TicketIcon />,
            title: 'Get the Pass',
            description: 'One payment. All deals. Valid Dec 1 – Jan 31.',
        },
        {
            icon: <PhoneIcon />,
            title: 'Flash Your Phone',
            description: 'Show your digital pass at checkout. No codes needed.',
        },
        {
            icon: <SavingsIcon />,
            title: 'Save Instantly',
            description: 'Discount applied on the spot. Done.',
        },
    ];

    return (
        <section id="how-it-works" className="py-20 md:py-32 bg-bg-card">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center mb-16 scroll-reveal">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-action-primary mb-4 md:mb-6">Howzit Work?</h1>
                    <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 md:mb-10">No printing. No paper coupons. Discover hidden gems and save instantly on your phone.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {steps.map((step, index) => (
                        <div 
                          key={index} 
                          className="bg-bg-primary rounded-xl p-6 text-center scroll-reveal border border-border-subtle hover:border-action-primary/30 transition-colors" 
                          style={{ transitionDelay: `${index * 150}ms` }}
                        >
                            <div className="flex justify-center mb-4">
                              <div className="w-16 h-16 rounded-full bg-action-primary/10 flex items-center justify-center">
                                {step.icon}
                              </div>
                            </div>
                            <h3 className="text-xl font-display font-bold text-text-primary mb-2">{step.title}</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;

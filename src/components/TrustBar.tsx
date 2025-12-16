import React from 'react';

interface TrustBarProps {
  venueCount?: number;
}

const TrustBar: React.FC<TrustBarProps> = ({ venueCount = 0 }) => {
  const logos = [
    { src: '/Images/1.svg', alt: 'Partner 1' },
    { src: '/Images/2.svg', alt: 'Partner 2' },
    { src: '/Images/3.svg', alt: 'Partner 3' },
    { src: '/Images/4.svg', alt: 'Partner 4' },
    { src: '/Images/5-copy.svg', alt: 'The Chef Pantry' },
  ];

  const venueCountText = venueCount > 0 ? `${venueCount}+ ` : '';

  return (
    <section className="py-8 md:py-10 bg-bg-card border-y border-border-subtle">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-sm text-text-secondary">
                Trusted by {venueCountText}schools & fundraiser partners
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center justify-center md:justify-start gap-2 text-text-secondary">
                  <svg className="w-5 h-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V7l8-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  </svg>
                  Secure checkout
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-text-secondary">
                  <svg className="w-5 h-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c2.21 0 4-1.79 4-4S14.21 3 12 3 8 4.79 8 7s1.79 4 4 4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 21a6 6 0 0112 0" />
                  </svg>
                  Verified entries
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-text-secondary">
                  <svg className="w-5 h-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Fundraiser-friendly
                </div>
              </div>
            </div>

            {/* Partner logos */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-6 md:gap-10 opacity-90">
              {logos.map((logo, index) => (
                <img
                  key={index}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-10 md:h-12 w-auto object-contain"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;

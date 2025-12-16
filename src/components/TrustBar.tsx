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
    <section className="py-10 md:py-14 bg-bg-primary border-b border-border-subtle">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-border-subtle p-6 sm:p-8">
          <p className="text-center text-sm text-gray-600 mb-5">
            Trusted by {venueCountText}local Port Alfred businesses
          </p>

          {/* Partner logos */}
          <div className="rounded-2xl border border-gray-300 p-4 sm:p-6">
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
              {logos.map((logo, index) => (
                <img
                  key={index}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-10 md:h-12 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
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

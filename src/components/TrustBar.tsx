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
    <section className="py-6 md:py-8 bg-white border-y border-border-subtle">
      <div className="container mx-auto px-4 sm:px-6">
        <p className="text-center text-sm text-gray-600 mb-4">
          Trusted by {venueCountText}local Port Alfred businesses
        </p>
        
        {/* Partner logos */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {logos.map((logo, index) => (
            <img
              key={index}
              src={logo.src}
              alt={logo.alt}
              className="h-10 md:h-12 w-auto object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;

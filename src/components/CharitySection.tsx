import React from 'react';

const CharitySection: React.FC = () => {
  return (
    <section id="charity" className="py-20 md:py-32 bg-bg-card">
      <div className="container mx-auto px-4 sm:px-6">
         <div className="max-w-3xl mx-auto text-center scroll-reveal">
           <h2 className="text-4xl md:text-5xl font-display font-black text-accent-primary mb-4 md:mb-6">Save Local. Feed Local.</h2>
           <div className="mb-6">
             <svg className="w-16 h-16 text-urgency-high mx-auto" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
             </svg>
           </div>
          <div className="text-lg text-text-secondary leading-relaxed">
            <p>This isn't just a discount pass. It's a community initiative. We donate 25% of every sale directly to the Port Alfred Soup Kitchen to help feed families right here in town.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CharitySection;

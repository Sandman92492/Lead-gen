import React from 'react';

const CharitySection: React.FC = () => {
  return (
    <section id="charity" className="pt-12 pb-8 md:pt-16 md:pb-12 bg-bg-card">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Text content */}
          <div className="text-center scroll-reveal mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-action-primary mb-4 md:mb-6">
              Save Local. Feed Local.
            </h2>
            <div className="mb-6">
              <svg className="w-16 h-16 text-urgency-high mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-lg text-text-secondary leading-relaxed max-w-3xl mx-auto">
              <p>
                We donate <strong className="text-action-primary">25% of every sale</strong> directly to the Port Alfred Soup Kitchen.{' '}
                <strong className="text-action-primary">Your purchase helps put food on the table for local families.</strong>
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="scroll-reveal">
            <img 
              src="/Images/charity2.webp" 
              alt="Making a difference in the Port Alfred community through charitable giving"
              className="rounded-2xl shadow-lg w-full max-w-3xl mx-auto h-64 sm:h-80 md:h-[420px] object-cover border border-border-subtle"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CharitySection;

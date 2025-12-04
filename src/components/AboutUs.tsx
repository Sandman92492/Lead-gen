import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center scroll-reveal">
          <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4">
            Who We Are
          </h2>
          <h3 className="text-3xl md:text-4xl font-display font-black text-action-primary mb-6">
            Made by Newcomers, for Everyone
          </h3>
          <p className="text-lg text-text-secondary leading-relaxed mb-8">
            We're <strong className="text-text-primary">FOUNDER_1</strong> and{' '}
            <strong className="text-text-primary">FOUNDER_2</strong>—newcomers to Port Alfred 
            who fell in love with this town and its people. We created the Holiday Pass to help 
            visitors discover the real Port Alfred, support the local businesses that welcomed us, 
            and give back to the community that's become our home.
          </p>
          <div className="flex items-center justify-center gap-2 text-text-secondary">
            <svg className="w-5 h-5 text-action-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C7.13 2 3 6.13 3 11c0 5.25 9 13 9 13s9-7.75 9-13c0-4.87-4.13-9-9-9zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="font-medium">Proudly Port Alfred</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

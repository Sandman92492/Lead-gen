import React from 'react';

const CharityImageSection: React.FC = () => {
  return (
    <section id="charity-image" className="py-20 md:py-32 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="scroll-reveal">
            <img 
              src="/Images/charity2.webp" 
              alt="Making a difference in the Port Alfred community through charitable giving"
              className="rounded-lg shadow-2xl w-full h-auto object-cover border-4 border-action-primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CharityImageSection;

import React from 'react';
import Badge from './ui/Badge';
import Card from './ui/Card';

const CharitySection: React.FC = () => {
  return (
    <section id="charity" className="py-16 md:py-24 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5 scroll-reveal text-center lg:text-left">
            <Badge variant="brand" size="sm">Where funds go</Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-display font-black text-text-primary tracking-tight">
              Real impact for the fundraiser
            </h2>
            <p className="mt-4 text-lg text-text-secondary leading-relaxed">
              Every ticket pack supports a school or NPO fundraiser. Funds help cover essentials and unlock opportunities for learners and the community.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <Card padding="sm" className="shadow-none bg-bg-card">
                <p className="text-sm font-semibold text-text-primary">Programs</p>
                <p className="mt-1 text-sm text-text-secondary">Sports, arts, and activities</p>
              </Card>
              <Card padding="sm" className="shadow-none bg-bg-card">
                <p className="text-sm font-semibold text-text-primary">Resources</p>
                <p className="mt-1 text-sm text-text-secondary">Learning materials & equipment</p>
              </Card>
              <Card padding="sm" className="shadow-none bg-bg-card">
                <p className="text-sm font-semibold text-text-primary">Community</p>
                <p className="mt-1 text-sm text-text-secondary">Support where it’s needed most</p>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-7 scroll-reveal">
            <Card padding="none" className="overflow-hidden">
              <img
                src="/Images/charity2.webp"
                alt="A school fundraiser making a difference in the community"
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
                loading="lazy"
              />
            </Card>
            <p className="mt-3 text-xs text-text-secondary text-center">
              Fundraiser imagery shown for illustration.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CharitySection;

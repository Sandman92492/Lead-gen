import React, { useState, useEffect } from 'react';
import { getPassPrice, getPassFeatures } from '../utils/pricing';
import { PassFeatures } from '../types';

interface FreUserTeaserProps {
  userName?: string;
  onSelectPass?: () => void;
}

const FreeUserTeaser: React.FC<FreUserTeaserProps> = ({ userName, onSelectPass }) => {
  const [passPrice, setPassPrice] = useState({ price: 199, cents: 19900, launchPricing: false });
  const [features, setFeatures] = useState<PassFeatures>({
    description: 'Discover and support Port Alfred\'s best local venues while enjoying great deals and authentic experiences.',
    feature1: 'Discover 70+ local venues and businesses',
    feature2: 'Support independent Port Alfred businesses',
    feature3: 'Enjoy verified savings and great experiences',
    venueCount: 70
  });

  useEffect(() => {
    const loadData = async () => {
      const price = await getPassPrice();
      const passFeatures = await getPassFeatures();
      setPassPrice(price);
      setFeatures(passFeatures);
    };
    loadData();
  }, []);

  return (
    <main className="pb-24 sm:pb-0">
      {/* Welcome Header */}
      <section className="bg-bg-primary pt-8 md:pt-16 pb-4 md:pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center scroll-reveal">
            <h1 className="text-3xl md:text-4xl font-display font-black text-text-primary mb-3">
              Welcome, {userName || 'Friend'}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-6">
              You're signed in, but your pass isn't active yet.
            </p>
            
            {/* Status Badge */}
            <div className="inline-block px-4 py-2 bg-urgency-high/20 rounded-full border-2 border-urgency-high">
              <span className="text-urgency-high font-bold text-sm">Free Account</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main CTA - Prominent Card */}
      <section className="bg-bg-primary py-6 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-action-primary rounded-2xl p-6 sm:p-8 md:p-12 shadow-xl scroll-reveal">
              <h2 className="text-2xl md:text-3xl font-display font-black text-white mb-3">
                Unlock Your Holiday Pass
              </h2>
              <p className="text-lg text-white/90 mb-2">
                Your key to premium Port Alfred deals
              </p>
              <p className="text-sm text-white/80 mb-6 md:mb-8">
                Exclusive access to verified savings at your favorite local venues
              </p>
              
              {/* Price Display */}
              <div className="bg-white/20 rounded-xl p-4 md:p-6 mb-6 md:mb-8 backdrop-blur-sm border border-white/30">
                {passPrice.launchPricing && (
                  <p className="text-white/80 text-sm font-semibold mb-2">🎉 Limited Launch Offer</p>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-display font-black text-white">R{passPrice.price}</span>
                  {passPrice.launchPricing && (
                    <>
                      <span className="text-white/70 line-through">R199</span>
                      <span className="text-value-highlight font-bold">{Math.round(((199 - passPrice.price) / 199) * 100)}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={onSelectPass}
                className="w-full bg-white text-action-primary font-bold text-lg py-4 px-6 rounded-lg hover:bg-white/95 transition-all duration-300 shadow-lg"
              >
                Get My Pass Now (R{passPrice.price}) →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Unlock */}
      <section className="hidden md:block bg-bg-primary py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 text-center">
              What You'll Unlock
            </h2>
            <p className="text-3xl md:text-4xl font-display font-black text-accent-primary mb-12 text-center">
              Access to Premium Deals
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { emoji: '🍽️', title: 'Local Dining', desc: 'Support family-run restaurants and cafes with great deals' },
                { emoji: '🏄', title: 'Local Adventures', desc: 'Discover outdoor experiences run by local guides' },
                { emoji: '🛍️', title: 'Local Retail', desc: 'Shop at unique local businesses you love' },
              ].map((category) => (
                <div
                  key={category.title}
                  className="bg-bg-card rounded-xl p-6 border-4 border-action-primary shadow-lg scroll-reveal hover:shadow-xl transition-all text-center"
                >
                  <div className="text-5xl mb-4">{category.emoji}</div>
                  <h3 className="text-lg font-display font-bold text-text-primary mb-2">
                    {category.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {category.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="bg-bg-card rounded-xl p-8 border-4 border-value-highlight shadow-lg">
              <h3 className="text-xl font-display font-black text-text-primary mb-6">Your Benefits:</h3>
              <ul className="space-y-4">
                {[
                  features.feature1,
                  features.feature2,
                  features.feature3,
                  "Easy one-tap redemptions in-store",
                  "Join a community that cares about local",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0">✓</span>
                    <span className="text-text-primary font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>


    </main>
  );
};

export default FreeUserTeaser;

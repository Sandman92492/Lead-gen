import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrustBar from '../components/TrustBar';
import { getPassPrice, getPassFeatures } from '../utils/pricing';
import { PassFeatures } from '../types';

interface FreUserTeaserProps {
  userName?: string;
  onSelectPass?: () => void;
}

const FreeUserTeaser: React.FC<FreUserTeaserProps> = ({ onSelectPass }) => {
  const navigate = useNavigate();
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
      const [price, passFeatures] = await Promise.all([
        getPassPrice(),
        getPassFeatures()
      ]);
      setPassPrice(price);
      setFeatures(passFeatures);
    };
    loadData();
  }, []);



  return (
    <main className="pb-24 sm:pb-0">
      {/* Main CTA - Prominent Card */}
      <section className="bg-bg-primary py-6 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-action-primary rounded-2xl p-6 sm:p-8 md:p-12 shadow-xl scroll-reveal">
              <h2 className="text-2xl md:text-3xl font-display font-black text-white mb-3">
                Support Local. Save Big.
              </h2>
              <p className="text-lg text-white/90 mb-4">
                Unlock exclusive savings across town. Support independent businesses and give 25% back to the Soup Kitchen with every purchase.
              </p>
              <p className="text-sm text-white/80 italic mb-8">
                Pays for itself in just one use.
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
              {passPrice.launchPricing && (
                <p className="text-white/80 text-sm text-center mt-4">
                  Limited launch pricing — only 33 left at R{passPrice.price}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Proof Strip */}
      <TrustBar venueCount={features.venueCount} />

      {/* Browse All Deals Section */}
      <section className="bg-bg-primary py-6 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => navigate('/deals')}
              className="w-full bg-action-primary text-white font-bold text-lg py-4 px-6 rounded-lg hover:bg-action-primary/90 transition-all duration-300 shadow-lg"
            >
              Browse All Deals
            </button>
          </div>
        </div>
      </section>

    </main>
  );
};

export default FreeUserTeaser;

import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { isPWAPromptAvailable, showPWAPrompt } from '../utils/pwaPrompt';
import { getAllDeals } from '../services/firestoreService';
import { Deal } from '../types';

interface ProfilePageProps {
  userEmail?: string;
  userPhotoURL?: string;
  onSignOut: () => void;
  hasPass?: boolean;
  redeemedDeals?: string[];
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
  onCharityClick?: () => void;
  onFaqClick?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userEmail, userPhotoURL, onSignOut, hasPass, redeemedDeals = [], onPrivacyClick, onTermsClick, onCharityClick, onFaqClick }) => {

  
  const [pwaAvailable, setPwaAvailable] = useState(isPWAPromptAvailable());
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);

  useEffect(() => {
    // Check initial state
    setPwaAvailable(isPWAPromptAvailable());
  }, []);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const deals = await getAllDeals();
        setAllDeals(deals);
      } catch (error) {
        console.error('Error loading deals:', error);
      }
    };
    loadDeals();
  }, []);

  // Find redeemed deals with their details
  const redeemedDealsDetails = redeemedDeals
    .map(dealName => allDeals.find(deal => deal.name === dealName))
    .filter(deal => deal !== undefined);

  return (
    <main className="pb-16 md:pb-0 bg-bg-primary">
      {/* Profile Header */}
      <section className="bg-gradient-to-b from-action-primary/10 to-bg-primary py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            {userPhotoURL ? (
              <img 
                src={userPhotoURL} 
                alt={userEmail || 'User profile'} 
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-action-primary shadow-lg flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
            {!userPhotoURL && userEmail && (
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-action-primary flex items-center justify-center text-bg-primary font-display font-extrabold text-2xl sm:text-4xl shadow-lg flex-shrink-0">
                {userEmail.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Profile Info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="text-2xl sm:text-4xl font-display font-black text-action-primary mb-2 break-words">
                Account
              </h1>
              <p className="text-text-secondary text-xs sm:text-sm mb-4 truncate">{userEmail}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-action-primary/10 rounded-full flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-action-primary flex-shrink-0"></div>
                <span className="text-xs font-semibold text-action-primary whitespace-nowrap">Account Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Account Details */}
        <div className="bg-bg-card rounded-xl border border-border-subtle p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-display font-bold text-action-primary mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Account Details
          </h2>

          <div className="space-y-6">
            <div className="pb-6 border-b border-border-subtle last:pb-0 last:border-0">
              <p className="text-text-secondary text-sm font-semibold uppercase tracking-wide mb-2">Email Address</p>
              <p className="text-text-primary text-lg">{userEmail}</p>
            </div>

            {hasPass && (
              <div className="pb-6 border-b border-border-subtle last:pb-0 last:border-0">
                <p className="text-text-secondary text-sm font-semibold uppercase tracking-wide mb-2">Subscription</p>
                <p className="text-text-primary text-lg">Holiday Pass Member</p>
              </div>
            )}

            <div>
              <p className="text-text-secondary text-sm font-semibold uppercase tracking-wide mb-2">Account Status</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-text-primary text-lg">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support & Resources */}
         <div className="bg-bg-card rounded-xl border border-border-subtle p-6 sm:p-8 mb-6">
           <h2 className="text-xl font-display font-bold text-action-primary mb-6 flex items-center gap-2">
             <svg className="w-5 h-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             Support & Resources
           </h2>

           {pwaAvailable && (
             <Button
               variant="secondary"
               className="w-full py-3 text-base font-bold mb-4 flex items-center justify-center gap-2"
               onClick={() => showPWAPrompt()}
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
               Install App
             </Button>
           )}

           <nav className="space-y-2">
             <button 
               onClick={onPrivacyClick}
               className="w-full text-left px-4 py-3 rounded-lg text-action-primary hover:bg-action-primary/10 transition-colors font-semibold text-sm sm:text-base"
             >
               Privacy Policy
             </button>
             <button 
               onClick={onTermsClick}
               className="w-full text-left px-4 py-3 rounded-lg text-action-primary hover:bg-action-primary/10 transition-colors font-semibold text-sm sm:text-base"
             >
               Terms of Service
             </button>
             <button 
               onClick={onFaqClick}
               className="w-full text-left px-4 py-3 rounded-lg text-action-primary hover:bg-action-primary/10 transition-colors font-semibold text-sm sm:text-base"
             >
               FAQ
             </button>
             <button 
               onClick={onCharityClick}
               className="w-full text-left px-4 py-3 rounded-lg text-action-primary hover:bg-action-primary/10 transition-colors font-semibold text-sm sm:text-base"
             >
               Holidaying with Heart
             </button>
             <a 
               href="https://wa.me/27799569040"
               target="_blank"
               rel="noopener noreferrer"
               className="block px-4 py-3 rounded-lg text-action-primary hover:bg-action-primary/10 transition-colors font-semibold text-sm sm:text-base flex items-center gap-2 min-w-0"
             >
               <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
               </svg>
               <span className="truncate">Chat with us on WhatsApp</span>
             </a>
           </nav>
        </div>

        {/* Redemption History */}
        {hasPass && (
          <div className="bg-bg-card rounded-xl border border-border-subtle p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-display font-bold text-action-primary flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Redemption History
            </h2>
            <Button
              variant="secondary"
              className="w-full py-3 text-base font-bold mb-4"
              onClick={() => setIsRedemptionModalOpen(true)}
            >
              View All
            </Button>
            {redeemedDealsDetails.length === 0 ? (
              <div className="bg-bg-primary rounded-lg p-4 text-center mt-4">
                <p className="text-text-secondary text-sm">
                  No redemptions yet. Start redeeming deals from your pass.
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-text-secondary text-sm">
                  You've redeemed <span className="font-bold text-action-primary">{redeemedDealsDetails.length}</span> deal{redeemedDealsDetails.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Redemption History Modal */}
        {isRedemptionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-bg-card rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto border border-border-subtle shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-bg-card border-b border-border-subtle p-6 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-action-primary flex items-center gap-2">
                  <svg className="w-6 h-6 text-action-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Redemption History
                </h2>
                <button
                  onClick={() => setIsRedemptionModalOpen(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {redeemedDealsDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">
                      No redemptions yet. Start redeeming deals from your pass.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {redeemedDealsDetails.map((deal) => (
                      <div key={deal!.name} className="bg-bg-primary rounded-lg p-4 border border-border-subtle hover:border-action-primary/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary text-base mb-1">{deal!.name}</h3>
                            <p className="text-text-secondary text-sm">{deal!.offer}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-success/20 text-success font-semibold text-sm">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Redeemed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
         <div className="bg-urgency-high/5 rounded-xl border-2 border-urgency-high p-6 sm:p-8">
           <h2 className="text-lg sm:text-xl font-display font-bold text-urgency-high mb-4 flex items-center gap-2">
             <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2" />
             </svg>
             <span>Account Actions</span>
           </h2>
           <p className="text-text-secondary mb-6 text-xs sm:text-sm leading-relaxed">
             Once you sign out, you'll need to sign in again to access your pass and redemptions.
           </p>
          <Button 
            variant="outline"
            className="w-full py-3 text-lg font-bold border-urgency-high text-urgency-high hover:bg-urgency-high/10"
            onClick={onSignOut}
          >
            Sign Out
          </Button>
        </div>
        </section>
        </main>
        );
        };

        export default ProfilePage;

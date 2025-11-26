import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PassFeatures } from '../types';

/**
 * Get current pass price based on Firestore config
 * Fetches pricing tiers from config/pricing document
 */
export const getPassPrice = async (): Promise<{ price: number; cents: number; launchPricing: boolean }> => {
  try {
    // Fetch pricing config from Firestore
    const pricingDoc = await getDoc(doc(db, 'config', 'pricing'));
    
    if (pricingDoc.exists()) {
      const pricingData = pricingDoc.data();
      const passCount = pricingData.currentPassCount || 0;
      const launchThreshold = pricingData.launchThreshold || 50;
      const launchPrice = pricingData.launchPrice || 99;
      const launchPriceCents = pricingData.launchPriceCents || 9900;
      const regularPrice = pricingData.regularPrice || 199;
      const regularPriceCents = pricingData.regularPriceCents || 19900;

      // Check if still in launch pricing based on threshold
      if (passCount < launchThreshold) {
        return { price: launchPrice, cents: launchPriceCents, launchPricing: true };
      }
      return { price: regularPrice, cents: regularPriceCents, launchPricing: false };
    }
    
    // Fallback defaults if config doesn't exist
    return getDefaultPrice();
  } catch (error) {
    console.error('Error fetching pass price:', error);
    return getDefaultPrice();
  }
};

/**
 * Get default pricing (fallback)
 */
const getDefaultPrice = (): { price: number; cents: number; launchPricing: boolean } => ({
  price: 199,
  cents: 19900,
  launchPricing: false
});

/**
 * Increment pass count in Firestore config/pricing
 * Call this after successful payment
 */
export const incrementPassCount = async (): Promise<void> => {
  try {
    const pricingRef = doc(db, 'config', 'pricing');
    const pricingDoc = await getDoc(pricingRef);
    const currentCount = pricingDoc.exists() ? (pricingDoc.data().currentPassCount || 0) : 0;
    
    // Use setDoc to update with new count
    const { setDoc } = await import('firebase/firestore');
    await setDoc(pricingRef, 
      { 
        currentPassCount: currentCount + 1,
        lastUpdated: new Date().toISOString()
      },
      { merge: true } // Merge to preserve other fields
    );
  } catch (error) {
    console.error('Error incrementing pass count:', error);
  }
};

/**
 * Get pass features from Firestore config
 * Returns default features if not found in database
 */
export const getPassFeatures = async (): Promise<PassFeatures> => {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'passFeatures'));
    if (configDoc.exists()) {
      return configDoc.data() as PassFeatures;
    }
    // Return defaults if document doesn't exist
    return getDefaultPassFeatures();
  } catch (error) {
    console.error('Error fetching pass features:', error);
    // Return defaults on error
    return getDefaultPassFeatures();
  }
};

/**
 * Get default pass features
 */
const getDefaultPassFeatures = (): PassFeatures => ({
  description: 'Discover and support Port Alfred\'s best local venues while enjoying great deals and authentic experiences.',
  feature1: 'Discover 70+ local venues and businesses',
  feature2: 'Support independent Port Alfred businesses',
  feature3: 'Enjoy verified savings and great experiences',
  venueCount: 70
});

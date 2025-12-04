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

/**
 * Get current pass count for social proof
 */
export const getPassCount = async (): Promise<number> => {
  try {
    const pricingDoc = await getDoc(doc(db, 'config', 'pricing'));
    if (pricingDoc.exists()) {
      return pricingDoc.data().currentPassCount || 0;
    }
    return 0;
  } catch {
    return 0;
  }
};

/**
 * Get launch pricing data including passes remaining at launch price
 */
export const getLaunchPricingData = async (): Promise<{
  passCount: number;
  launchThreshold: number;
  passesRemaining: number;
  isLaunchPricing: boolean;
}> => {
  try {
    const pricingDoc = await getDoc(doc(db, 'config', 'pricing'));
    if (pricingDoc.exists()) {
      const data = pricingDoc.data();
      const passCount = data.currentPassCount || 0;
      const launchThreshold = data.launchThreshold || 50;
      const passesRemaining = Math.max(0, launchThreshold - passCount);
      const isLaunchPricing = passCount < launchThreshold;
      
      return { passCount, launchThreshold, passesRemaining, isLaunchPricing };
    }
    return { passCount: 0, launchThreshold: 50, passesRemaining: 50, isLaunchPricing: true };
  } catch {
    return { passCount: 0, launchThreshold: 50, passesRemaining: 50, isLaunchPricing: true };
  }
};

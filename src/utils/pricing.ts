import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PassFeatures } from '../types';

const PAHP_CACHED_PRICING_CONFIG_KEY = 'pahp_cached_pricing_config_v1';
const PAHP_CACHED_PASS_FEATURES_KEY = 'pahp_cached_pass_features_v1';

type CachedValue<T> = {
  cachedAt: string;
  data: T;
};

type PricingConfigData = {
  currentPassCount?: number;
  launchThreshold?: number;
  launchPrice?: number;
  launchPriceCents?: number;
  regularPrice?: number;
  regularPriceCents?: number;
};

const isNavigatorOffline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
};

const getCachedValue = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedValue<T>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.data || typeof parsed.data !== 'object') return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const setCachedValue = <T,>(key: string, data: T) => {
  try {
    const payload: CachedValue<T> = { cachedAt: new Date().toISOString(), data };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore cache errors
  }
};

const computePassPriceFromPricingData = (pricingData: PricingConfigData): { price: number; cents: number; launchPricing: boolean } => {
  const passCount = pricingData.currentPassCount || 0;
  const launchThreshold = pricingData.launchThreshold || 50;
  const launchPrice = pricingData.launchPrice || 99;
  const launchPriceCents = pricingData.launchPriceCents || 9900;
  const regularPrice = pricingData.regularPrice || 199;
  const regularPriceCents = pricingData.regularPriceCents || 19900;

  if (passCount < launchThreshold) {
    return { price: launchPrice, cents: launchPriceCents, launchPricing: true };
  }
  return { price: regularPrice, cents: regularPriceCents, launchPricing: false };
};

const computeLaunchPricingFromPricingData = (pricingData: PricingConfigData): {
  passCount: number;
  launchThreshold: number;
  passesRemaining: number;
  isLaunchPricing: boolean;
} => {
  const passCount = pricingData.currentPassCount || 0;
  const launchThreshold = pricingData.launchThreshold || 50;
  const passesRemaining = Math.max(0, launchThreshold - passCount);
  const isLaunchPricing = passCount < launchThreshold;

  return { passCount, launchThreshold, passesRemaining, isLaunchPricing };
};

/**
 * Get current pass price based on Firestore config
 * Fetches pricing tiers from config/pricing document
 */
export const getPassPrice = async (): Promise<{ price: number; cents: number; launchPricing: boolean }> => {
  try {
    if (isNavigatorOffline()) {
      const cachedPricing = getCachedValue<PricingConfigData>(PAHP_CACHED_PRICING_CONFIG_KEY);
      if (cachedPricing) {
        return computePassPriceFromPricingData(cachedPricing);
      }
      return getDefaultPrice();
    }

    // Fetch pricing config from Firestore
    const pricingDoc = await getDoc(doc(db, 'config', 'pricing'));
    
    if (pricingDoc.exists()) {
      const pricingData = pricingDoc.data() as PricingConfigData;
      setCachedValue(PAHP_CACHED_PRICING_CONFIG_KEY, pricingData);
      return computePassPriceFromPricingData(pricingData);
    }
    
    // Fallback defaults if config doesn't exist
    return getDefaultPrice();
  } catch (error) {
    console.error('Error fetching pass price:', error);

    const cachedPricing = getCachedValue<PricingConfigData>(PAHP_CACHED_PRICING_CONFIG_KEY);
    if (cachedPricing) {
      return computePassPriceFromPricingData(cachedPricing);
    }

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
    if (isNavigatorOffline()) {
      const cachedFeatures = getCachedValue<PassFeatures>(PAHP_CACHED_PASS_FEATURES_KEY);
      if (cachedFeatures) return cachedFeatures;
      return getDefaultPassFeatures();
    }

    const configDoc = await getDoc(doc(db, 'config', 'passFeatures'));
    if (configDoc.exists()) {
      const features = configDoc.data() as PassFeatures;
      setCachedValue(PAHP_CACHED_PASS_FEATURES_KEY, features);
      return features;
    }
    // Return defaults if document doesn't exist
    return getDefaultPassFeatures();
  } catch (error) {
    console.error('Error fetching pass features:', error);

    const cachedFeatures = getCachedValue<PassFeatures>(PAHP_CACHED_PASS_FEATURES_KEY);
    if (cachedFeatures) return cachedFeatures;

    // Return defaults on error
    return getDefaultPassFeatures();
  }
};

/**
 * Get default pass features
 */
const getDefaultPassFeatures = (): PassFeatures => ({
  description: 'Discover and support Port Alfred\'s best local venues while enjoying great deals and authentic experiences.',
  feature1: 'Discover local venues and businesses',
  feature2: 'Support independent Port Alfred businesses',
  feature3: 'Enjoy verified savings and great experiences',
  venueCount: 0
});

/**
 * Get current pass count for social proof
 */
export const getPassCount = async (): Promise<number> => {
  try {
    if (isNavigatorOffline()) {
      const cachedPricing = getCachedValue<PricingConfigData>(PAHP_CACHED_PRICING_CONFIG_KEY);
      if (cachedPricing) {
        return cachedPricing.currentPassCount || 0;
      }
      return 0;
    }

    const pricingDoc = await getDoc(doc(db, 'config', 'pricing'));
    if (pricingDoc.exists()) {
      const pricingData = pricingDoc.data() as PricingConfigData;
      setCachedValue(PAHP_CACHED_PRICING_CONFIG_KEY, pricingData);
      return pricingData.currentPassCount || 0;
    }
    return 0;
  } catch {
    const cachedPricing = getCachedValue<PricingConfigData>(PAHP_CACHED_PRICING_CONFIG_KEY);
    if (cachedPricing) {
      return cachedPricing.currentPassCount || 0;
    }
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
    if (isNavigatorOffline()) {
      const cachedPricing = getCachedValue<PricingConfigData>(PAHP_CACHED_PRICING_CONFIG_KEY);
      if (cachedPricing) {
        return computeLaunchPricingFromPricingData(cachedPricing);
      }
      return { passCount: 0, launchThreshold: 50, passesRemaining: 0, isLaunchPricing: false };
    }

    const pricingDoc = await getDoc(doc(db, 'config', 'pricing'));
    if (pricingDoc.exists()) {
      const data = pricingDoc.data() as PricingConfigData;
      setCachedValue(PAHP_CACHED_PRICING_CONFIG_KEY, data);
      return computeLaunchPricingFromPricingData(data);
    }
    return { passCount: 0, launchThreshold: 50, passesRemaining: 50, isLaunchPricing: true };
  } catch {
    const cachedPricing = getCachedValue<PricingConfigData>(PAHP_CACHED_PRICING_CONFIG_KEY);
    if (cachedPricing) {
      return computeLaunchPricingFromPricingData(cachedPricing);
    }
    if (isNavigatorOffline()) {
      return { passCount: 0, launchThreshold: 50, passesRemaining: 0, isLaunchPricing: false };
    }
    return { passCount: 0, launchThreshold: 50, passesRemaining: 50, isLaunchPricing: true };
  }
};

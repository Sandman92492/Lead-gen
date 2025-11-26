import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Get current pass price based on user count
 * R99 for first 50 users (launch pricing)
 * R199 from user 50 onwards
 */
export const getPassPrice = async (): Promise<{ price: number; cents: number; launchPricing: boolean }> => {
  try {
    // Fetch user count from Firestore
    const statsDoc = await getDoc(doc(db, 'stats', 'passCount'));
    const passCount = statsDoc.exists() ? (statsDoc.data().count || 0) : 0;

    // R99 for first 50 users, R199 after
    if (passCount < 50) {
      return { price: 99, cents: 9900, launchPricing: true };
    }
    return { price: 199, cents: 19900, launchPricing: false };
  } catch (error) {
    console.error('Error fetching pass price:', error);
    // Fallback to R199 if error
    return { price: 199, cents: 19900, launchPricing: false };
  }
};

/**
 * Increment pass count in Firestore
 * Call this after successful payment
 */
export const incrementPassCount = async (): Promise<void> => {
  try {
    const statsRef = doc(db, 'stats', 'passCount');
    const statsDoc = await getDoc(statsRef);
    const currentCount = statsDoc.exists() ? (statsDoc.data().count || 0) : 0;
    
    // Use setDoc to create or overwrite
    const { setDoc } = await import('firebase/firestore');
    await setDoc(statsRef, { count: currentCount + 1, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error('Error incrementing pass count:', error);
  }
};
